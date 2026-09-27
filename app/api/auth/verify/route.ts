import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { verifyUserEmailInD1, findUserByEmailInD1 } from '@/lib/db';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const body = await request.json() as { userId?: string; email?: string; code?: string };
    const { userId, email, code } = body;

    let targetUserId = userId;

    if (!targetUserId && email) {
      const user = await findUserByEmailInD1(env.DB, email);
      if (user) {
        targetUserId = user.id;
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, message: 'User ID or valid email is required' },
        { status: 400 }
      );
    }

    // Verify code check if code was provided
    if (code) {
      const metaKey = `verify_code:${targetUserId}`;
      const record = await env.DB.prepare('SELECT val FROM app_meta WHERE key = ?')
        .bind(metaKey)
        .first<{ val: string }>();

      if (record?.val && record.val !== code.trim()) {
        return NextResponse.json(
          { success: false, message: 'Invalid verification code. Please check and try again.' },
          { status: 400 }
        );
      }
    }

    await verifyUserEmailInD1(env.DB, targetUserId);

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
