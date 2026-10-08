import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { isBoardOwner } from '@/lib/board-permissions';
import { getSessionUserId } from '@/lib/server-auth';

export async function DELETE(request: Request) {
  const query = new URL(request.url).searchParams;
  const boardId = query.get('boardId');
  const targetUserId = query.get('userId');
  if (!boardId || !targetUserId) {
    return NextResponse.json({ message: 'Board and member IDs are required.' }, { status: 400 });
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    const actorId = await getSessionUserId(env.DB, request);
    if (!actorId) return NextResponse.json({ message: 'Authentication is required.' }, { status: 401 });
    if (!await isBoardOwner(env.DB, boardId, actorId)) {
      return NextResponse.json({ message: 'Only the board owner can remove members.' }, { status: 403 });
    }
    if (actorId === targetUserId) {
      return NextResponse.json({ message: 'You cannot remove yourself as the board owner.' }, { status: 400 });
    }
    const board = await env.DB.prepare('SELECT owner_id FROM boards WHERE id = ?')
      .bind(boardId)
      .first<{ owner_id: string }>();
    if (!board) return NextResponse.json({ message: 'Board not found.' }, { status: 404 });
    if (board.owner_id === targetUserId) {
      return NextResponse.json({ message: 'The board owner cannot be removed.' }, { status: 400 });
    }
    const result = await env.DB.prepare('DELETE FROM board_members WHERE board_id = ? AND user_id = ?')
      .bind(boardId, targetUserId)
      .run();
    if (!result.meta.changes) return NextResponse.json({ message: 'Board member not found.' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Member removal failed:', error);
    return NextResponse.json({ message: 'Unable to remove the board member.' }, { status: 500 });
  }
}
