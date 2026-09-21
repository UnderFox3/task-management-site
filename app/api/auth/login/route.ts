import { NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/db';
import { normalizeEmail, verifyPassword } from '@/lib/rbac';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    const normalized = normalizeEmail(email);
    const user = findUserByEmail(normalized);
    if (!user) {
      return NextResponse.json({ success: false, message: 'No account was found for that email.' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ success: false, message: 'Incorrect password.' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: `Welcome back, ${user.username}!`,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Internal server error', details: String(err) }, { status: 500 });
  }
}
