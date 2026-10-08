import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { isBoardOwner } from '@/lib/board-permissions';
import { getSessionUserId } from '@/lib/server-auth';

export async function GET(request: Request) {
  const boardId = new URL(request.url).searchParams.get('boardId');
  if (!boardId) return NextResponse.json({ message: 'A board ID is required.' }, { status: 400 });

  try {
    const { env } = await getCloudflareContext({ async: true });
    const userId = await getSessionUserId(env.DB, request);
    if (!userId) return NextResponse.json({ message: 'Authentication is required.' }, { status: 401 });
    if (!await isBoardOwner(env.DB, boardId, userId)) {
      return NextResponse.json({ message: 'Only the board owner can manage members.' }, { status: 403 });
    }

    await env.DB.prepare('DELETE FROM board_invitations WHERE board_id = ? AND expires_at <= ?')
      .bind(boardId, new Date().toISOString())
      .run();

    const [board, members, invitations] = await Promise.all([
      env.DB.prepare('SELECT owner_id FROM boards WHERE id = ?').bind(boardId).first<{ owner_id: string }>(),
      env.DB.prepare(`
        SELECT u.id AS user_id, u.email, u.username, bm.role, bm.invited_at
        FROM board_members bm JOIN users u ON u.id = bm.user_id
        WHERE bm.board_id = ?
      `).bind(boardId).all<{ user_id: string; email: string; username: string; role: string; invited_at: string }>(),
      env.DB.prepare('SELECT email, role, expires_at FROM board_invitations WHERE board_id = ? ORDER BY created_at')
        .bind(boardId).all<{ email: string; role: string; expires_at: string }>(),
    ]);
    if (!board) return NextResponse.json({ message: 'Board not found.' }, { status: 404 });

    const memberMap = new Map((members.results ?? []).map((member) => [member.user_id, member]));
    if (!memberMap.has(board.owner_id)) {
      const owner = await env.DB.prepare('SELECT id AS user_id, email, username FROM users WHERE id = ?')
        .bind(board.owner_id).first<{ user_id: string; email: string; username: string }>();
      if (owner) {
        memberMap.set(board.owner_id, {
          ...owner,
          role: 'owner',
          invited_at: '',
        });
      }
    }

    return NextResponse.json({
      members: [...memberMap.values()].map((member) => ({
        userId: member.user_id,
        email: member.email,
        username: member.username,
        role: member.user_id === board.owner_id ? 'owner' : member.role,
        invitedAt: member.invited_at,
      })),
      invitations: invitations.results ?? [],
    });
  } catch (error) {
    console.error('Failed to load board members:', error);
    return NextResponse.json({ message: 'Unable to load board members.' }, { status: 500 });
  }
}
