import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { isBoardOwner } from '@/lib/board-permissions';
import { getSessionUserId } from '@/lib/server-auth';

type ChangeRoleRequest = { boardId?: unknown; userId?: unknown; role?: unknown };

export async function PATCH(request: Request) {
  let body: ChangeRoleRequest;
  try {
    body = await request.json() as ChangeRoleRequest;
  } catch {
    return NextResponse.json({ message: 'A valid JSON request body is required.' }, { status: 400 });
  }
  if (typeof body.boardId !== 'string' || typeof body.userId !== 'string' ||
    (body.role !== 'editor' && body.role !== 'viewer')) {
    return NextResponse.json({ message: 'A board, member, and editor or viewer role are required.' }, { status: 400 });
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    const actorId = await getSessionUserId(env.DB, request);
    if (!actorId) return NextResponse.json({ message: 'Authentication is required.' }, { status: 401 });
    if (!await isBoardOwner(env.DB, body.boardId, actorId)) {
      return NextResponse.json({ message: 'Only the board owner can change roles.' }, { status: 403 });
    }
    if (body.userId === actorId) {
      return NextResponse.json({ message: 'You cannot change your own owner role.' }, { status: 400 });
    }
    const target = await env.DB.prepare(
      'SELECT role FROM board_members WHERE board_id = ? AND user_id = ?',
    ).bind(body.boardId, body.userId).first<{ role: string }>();
    if (!target) return NextResponse.json({ message: 'Board member not found.' }, { status: 404 });
    if (target.role === 'owner') {
      return NextResponse.json({ message: 'Transfer ownership before changing the owner role.' }, { status: 400 });
    }
    await env.DB.prepare('UPDATE board_members SET role = ? WHERE board_id = ? AND user_id = ?')
      .bind(body.role, body.boardId, body.userId)
      .run();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Member role update failed:', error);
    return NextResponse.json({ message: 'Unable to update the member role.' }, { status: 500 });
  }
}
