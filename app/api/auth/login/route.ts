import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { findUserByEmailInD1, seedDatabaseIfEmpty } from '@/lib/db';
import { normalizeEmail, verifyPassword } from '@/lib/rbac';

type LoginRequest = {
  email: string;
  password: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginRequest;
    const { env } = await getCloudflareContext({ async: true });
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    await seedDatabaseIfEmpty(env.DB, env.ENABLE_LOCAL_DEMO_SEED === 'true');

    const normalized = normalizeEmail(email);
    const user = await findUserByEmailInD1(env.DB, normalized);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No account was found for that email.' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Incorrect password.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Welcome back, ${user.username}!`,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        emailVerified: user.emailVerified ?? false,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', details: String(err) },
      { status: 500 }
    );
  }
}
