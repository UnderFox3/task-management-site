import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { verifyUserEmailInD1, findUserByEmailInD1 } from '@/lib/db';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const body = await request.json() as { token: string };
    const { token } = body;

    if (!token) {
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

    console.log("TOKEN RECORD:", tokenRecord);

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

    console.log("TARGET USER:", targetUserId);

    await verifyUserEmailInD1(env.DB, targetUserId);

    await env.DB.prepare('DELETE FROM verification_tokens WHERE token = ?').bind(token).run();

    console.log("VERIFIED SUCCESSFULLY")

    return NextResponse.json({
      success: true,
      message: 'Email address has been successfully verified!',
      userId: targetUserId,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Failed to verify email', details: String(err) },
      { status: 500 }
    );
  }
}
