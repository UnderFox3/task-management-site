import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { findUserByEmailInD1, insertUserInD1, seedDatabaseIfEmpty } from '@/lib/db';
import { hashPassword, normalizeEmail } from '@/lib/rbac';
import { generateId } from '@/lib/store';
import type { User } from '@/lib/types';

export const runtime = 'edge';

type RegisterRequest = {
  email: string;
  username: string;
  password: string;
};

function isDummyEmail(email: string): boolean {
  const dummyDomains = [
    'example.com',
    'example.org',
    'example.net',
    'test.com',
    'dummy.com',
    'fake.com',
    'itask.local',
    'localhost',
    'mailinator.com',
    'tempmail.com',
  ];
  const parts = email.toLowerCase().split('@');
  if (parts.length !== 2) return true;
  const domain = parts[1];
  return dummyDomains.some((d) => domain === d || domain.endsWith('.' + d)) || !domain.includes('.');
}

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

    // Ensure database is seeded if fresh
    await seedDatabaseIfEmpty(env.DB);

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

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    await env.DB.prepare('INSERT OR REPLACE INTO app_meta (key, val) VALUES (?, ?)')
      .bind(`verify_code:${userId}`, verificationCode)
      .run();

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

    const message = isDummy
      ? 'Account created. Using a demo email address: your account remains unverified, but full site features are active for demonstration.'
      : `Account created successfully! Verification code: ${verificationCode}`;

    return NextResponse.json({
      success: true,
      message,
      verificationCode,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        emailVerified: false,
        createdAt: newUser.createdAt,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', details: String(err) },
      { status: 500 }
    );
  }
}
