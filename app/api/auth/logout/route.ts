import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { deleteSession, expiredSessionCookie } from '@/lib/server-auth';

export async function POST(request: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    await deleteSession(env.DB, request);
    return NextResponse.json(
      { success: true },
      { headers: { 'Set-Cookie': expiredSessionCookie(request) } },
    );
  } catch (error) {
    console.error('Failed to end session:', error);
    return NextResponse.json({ success: false, message: 'Unable to sign out.' }, { status: 500 });
  }
}
