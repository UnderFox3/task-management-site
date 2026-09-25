import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { findUserByEmailInD1, insertUserInD1 } from '@/lib/db';
import { hashPassword, normalizeEmail } from '@/lib/rbac';
import { generateId } from '@/lib/store';
import type { User } from '@/lib/types';

export const runtime = 'edge';

type registerRequest = {
  email: string;
  username: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as registerRequest;
    const { env } = await getCloudflareContext({ async: true });
    const { email, username, password } = body;
    const normalized = normalizeEmail(email || '');

    if (!normalized || !password || password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email and a password with at least 8 characters.' },
        { status: 400 }
      );
    }

    const existing = await findUserByEmailInD1(env.DB, normalized);
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'An account with that email already exists.' },
        { status: 409 }
      );
    }
    const userId = generateId();
    const newUser: User = {
      id: userId,
      email: normalized,
      username: username ? username.trim() : `user_${userId.slice(0, 4)}`,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    await insertUserInD1(env.DB, newUser);

    const verifyRow = await env.DB
      .prepare("SELECT email, password_hash FROM users WHERE email = ?")
      .bind(newUser.email)
      .first()

    const verify = await findUserByEmailInD1(env.DB, newUser.email);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully.',
      user: { id: newUser.id, email: newUser.email, username: newUser.username, createdAt: newUser.createdAt },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', details: String(err) },
      { status: 500 }
    );
  }
}
