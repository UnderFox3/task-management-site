import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { verifyUserEmailInD1 } from '@/lib/db';

export async function POST(request: Request) {
  let body: { token?: unknown };
  try {
    body = await request.json() as { token?: unknown };
  } catch {
    return NextResponse.json(
      { success: false, message: 'A valid JSON request body is required.' },
      { status: 400 }
    );
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    const token = body.token;

    if (typeof token !== 'string' || !token.trim()) {
      return NextResponse.json(
        { success: false, message: 'Token is required' },
        { status: 400 }
      );
    }

    const tokenRecord = await env.DB.prepare('SELECT user_id, expires_at FROM verification_tokens WHERE token = ?')
      .bind(token)
      .first<{
        user_id: string;
        expires_at: string;
      }>();

    if (!tokenRecord) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification token' },
        { status: 400 }
      );
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, message: 'Verification token has expired' },
        { status: 400 }
      );
    }

    const targetUserId = tokenRecord.user_id;
    await verifyUserEmailInD1(env.DB, targetUserId);
    await env.DB.prepare('DELETE FROM verification_tokens WHERE token = ?').bind(token).run();

    return NextResponse.json({
      success: true,
      message: 'Email address has been successfully verified!',
      userId: targetUserId,
    });
  } catch (err) {
    console.error('Failed to verify email:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to verify email.' },
      { status: 500 }
    );
  }
}
