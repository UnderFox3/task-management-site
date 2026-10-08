import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { hashInvitationToken } from '@/lib/board-invitations';
import { normalizeEmail } from '@/lib/rbac';
import { getSessionUserId } from '@/lib/server-auth';

type AcceptRequest = { token?: unknown };

export async function POST(request: Request) {
  let body: AcceptRequest;
  try {
    body = await request.json() as AcceptRequest;
  } catch {
    return NextResponse.json({ message: 'A valid JSON request body is required.' }, { status: 400 });
  }
  if (typeof body.token !== 'string' || body.token.length < 20 || body.token.length > 200) {
    return NextResponse.json({ message: 'A valid invitation token is required.' }, { status: 400 });
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    const userId = await getSessionUserId(env.DB, request);
    if (!userId) return NextResponse.json({ message: 'Sign in to accept this invitation.' }, { status: 401 });
    const tokenHash = await hashInvitationToken(body.token);
    const invitation = await env.DB.prepare(`
      SELECT i.board_id, i.email, i.role, i.expires_at, b.title
      FROM board_invitations i JOIN boards b ON b.id = i.board_id
      WHERE i.token_hash = ?
    `).bind(tokenHash).first<{
      board_id: string;
      email: string;
      role: 'editor' | 'viewer';
      expires_at: string;
      title: string;
    }>();
    if (!invitation || Date.parse(invitation.expires_at) <= Date.now()) {
      if (invitation) await env.DB.prepare('DELETE FROM board_invitations WHERE token_hash = ?').bind(tokenHash).run();
      return NextResponse.json({ message: 'This invitation is invalid or has expired.' }, { status: 410 });
    }

    const user = await env.DB.prepare('SELECT email FROM users WHERE id = ?')
      .bind(userId)
      .first<{ email: string }>();
    if (!user) return NextResponse.json({ message: 'The signed-in account no longer exists.' }, { status: 401 });
    if (normalizeEmail(user.email) !== normalizeEmail(invitation.email)) {
      return NextResponse.json({ message: 'Sign in with the email address this invitation was sent to.' }, { status: 403 });
    }

    const existingMember = await env.DB.prepare(
      'SELECT 1 AS member FROM board_members WHERE board_id = ? AND user_id = ?',
    ).bind(invitation.board_id, userId).first<{ member: number }>();
    if (existingMember) {
      return NextResponse.json({ message: 'You are already a member of this board.' }, { status: 409 });
    }

    await env.DB.batch([
      env.DB.prepare('INSERT INTO board_members (board_id, user_id, role, invited_at) VALUES (?, ?, ?, ?)')
        .bind(invitation.board_id, userId, invitation.role, new Date().toISOString()),
      env.DB.prepare('DELETE FROM board_invitations WHERE token_hash = ?').bind(tokenHash),
    ]);
    return NextResponse.json({
      success: true,
      boardId: invitation.board_id,
      message: `You joined ${invitation.title} as a ${invitation.role}.`,
    });
  } catch (error) {
    console.error('Invitation acceptance failed:', error);
    return NextResponse.json({ message: 'Unable to accept this invitation.' }, { status: 500 });
  }
}
