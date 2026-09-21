import { NextResponse } from 'next/server';
import { findUserByEmail, insertUser } from '@/lib/db';
import { hashPassword, normalizeEmail } from '@/lib/rbac';
import { generateId } from '@/lib/store';
import type { User } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { email, username, password } = await request.json();
    const normalized = normalizeEmail(email || '');

    if (!normalized || !password || password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email and a password with at least 8 characters.' },
        { status: 400 }
      );
    }

    const existing = findUserByEmail(normalized);
    if (existing) {
      return NextResponse.json({ success: false, message: 'An account with that email already exists.' }, { status: 409 });
    }

    const userId = generateId();
    const newUser: User = {
      id: userId,
      email: normalized,
      username: username ? username.trim() : `user_${userId.slice(0, 4)}`,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    insertUser(newUser);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully.',
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        createdAt: newUser.createdAt,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Internal server error', details: String(err) }, { status: 500 });
  }
}
