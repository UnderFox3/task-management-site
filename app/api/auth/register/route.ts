import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createVerificationTokenInD1, findUserByEmailInD1, insertUserInD1, seedDatabaseIfEmpty } from '@/lib/db';
import { hashPassword, normalizeEmail } from '@/lib/rbac';
import { generateId } from '@/lib/store';
import type { User } from '@/lib/types';
import { createSession, sessionCookie } from '@/lib/server-auth';
import {
  createVerificationUrl,
  getEmailAppUrl,
  getVerificationEmailSettings,
  isDummyEmail,
  sendVerificationEmail,
} from '@/lib/email-verification';

type RegisterRequest = {
  email: string;
  username: string;
  password: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterRequest;
    const { env } = await getCloudflareContext({ async: true });
    const { email, username, password } = body;
    const normalized = normalizeEmail(email || '');

    if (!normalized || !password || password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email and a password with at least 8 characters.' },
        { status: 400 }
      );
    }

    await seedDatabaseIfEmpty(env.DB, env.ENABLE_LOCAL_DEMO_SEED === 'true');

    // Check duplicate email
    const existing = await findUserByEmailInD1(env.DB, normalized);
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'An account with that email already exists.' },
        { status: 409 }
      );
    }

    const trimmedUsername = username ? username.trim() : `user_${generateId().slice(0, 4)}`;

    // Check duplicate username
    const existingUsername = await env.DB
      .prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(?)')
      .bind(trimmedUsername)
      .first();

    if (existingUsername) {
      return NextResponse.json(
        { success: false, message: 'That username is already taken. Please choose another.' },
        { status: 409 }
      );
    }

    const userId = generateId();
    const isDummy = isDummyEmail(normalized);

    const hashedPassword = await hashPassword(password);
    const newUser: User = {
      id: userId,
      email: normalized,
      username: trimmedUsername,
      passwordHash: hashedPassword,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };

    await insertUserInD1(env.DB, newUser);
    const session = await createSession(env.DB, newUser.id);

    let emailSent = false;
    let message: string;
    if (isDummy && process.env.NODE_ENV === 'production') {
      message = 'Account created with a demo email address. Verification emails are disabled for demo addresses.';
    } else {
      const settings = getVerificationEmailSettings(env);
      const appUrl = getEmailAppUrl(request, settings.appUrl);
      if (!appUrl) {
        message = 'Account created, but verification email is not configured. Please request an email again later.';
      } else {
        try {
          const token = await createVerificationTokenInD1(env.DB, newUser.id);
          const verificationUrl = createVerificationUrl(appUrl, token);
          emailSent = await sendVerificationEmail(
            settings.apiKey,
            settings.from,
            newUser.email,
            newUser.username,
            verificationUrl,
          );
          message = emailSent
            ? `Account created successfully! A verification email was sent to ${newUser.email}.`
            : 'Account created. The development verification link was printed to the server console.';
        } catch (error) {
          console.error('Failed to create or send registration verification email:', error);
          console.error('VERIFY EMAIL STACK:', error instanceof Error ? error.stack : String(error));
          message = 'Account created, but verification could not be started. Please request another email later.';
        }
      }
    }

    return NextResponse.json({
      success: true,
      message,
      emailSent,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        emailVerified: false,
        createdAt: newUser.createdAt,
      },
    }, {
      headers: { 'Set-Cookie': sessionCookie(session, request) },
    });
  } catch (err) {
    console.error("REGISTER ROUTE ERROR:", err);

    return NextResponse.json(
      { success: false, message: 'Internal server error', details: err instanceof Error ? err.stack : String(err) },
      { status: 500 }
    );
  }
}
