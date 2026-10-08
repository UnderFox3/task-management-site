import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { isBoardOwner } from '@/lib/board-permissions';
import { getSessionUserId } from '@/lib/server-auth';

type TransferRequest = { boardId?: unknown; userId?: unknown };

export async function POST(request: Request) {
  let body: TransferRequest;
  try {
    body = await request.json() as TransferRequest;
  } catch {
    return NextResponse.json({ message: 'A valid JSON request body is required.' }, { status: 400 });
  }
  if (typeof body.boardId !== 'string' || typeof body.userId !== 'string') {
    return NextResponse.json({ message: 'Board and new owner IDs are required.' }, { status: 400 });
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    const actorId = await getSessionUserId(env.DB, request);
    if (!actorId) return NextResponse.json({ message: 'Authentication is required.' }, { status: 401 });
    if (!await isBoardOwner(env.DB, body.boardId, actorId)) {
      return NextResponse.json({ message: 'Only the board owner can transfer ownership.' }, { status: 403 });
    }
    if (actorId === body.userId) {
      return NextResponse.json({ message: 'Choose another member to transfer ownership.' }, { status: 400 });
    }
    const target = await env.DB.prepare(
      'SELECT role FROM board_members WHERE board_id = ? AND user_id = ?',
    ).bind(body.boardId, body.userId).first<{ role: string }>();
    if (!target || target.role === 'owner') {
      return NextResponse.json({ message: 'The new owner must be an existing non-owner member.' }, { status: 400 });
    }

    await env.DB.batch([
      env.DB.prepare(`
        INSERT OR IGNORE INTO board_members (board_id, user_id, role, invited_at)
        VALUES (?, ?, 'owner', ?)
      `).bind(body.boardId, actorId, new Date().toISOString()),
      env.DB.prepare('UPDATE boards SET owner_id = ? WHERE id = ? AND owner_id = ?')
        .bind(body.userId, body.boardId, actorId),
      env.DB.prepare("UPDATE board_members SET role = 'editor' WHERE board_id = ? AND user_id = ?")
        .bind(body.boardId, actorId),
      env.DB.prepare("UPDATE board_members SET role = 'owner' WHERE board_id = ? AND user_id = ?")
        .bind(body.boardId, body.userId),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ownership transfer failed:', error);
    return NextResponse.json({ message: 'Unable to transfer board ownership.' }, { status: 500 });
  }
}
