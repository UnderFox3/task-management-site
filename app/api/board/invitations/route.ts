import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import {
  createInvitationUrl,
  hashInvitationToken,
  INVITATION_DURATION_MS,
  isValidInvitationEmail,
  normalizeInvitationEmail,
  sendBoardInvitationEmail,
} from '@/lib/board-invitations';
import { isBoardOwner } from '@/lib/board-permissions';
import { getEmailAppUrl, getVerificationEmailSettings } from '@/lib/email-verification';
import { getSessionUserId } from '@/lib/server-auth';

type InvitationRequest = {
  boardId?: unknown;
  email?: unknown;
  role?: unknown;
};

async function sendInvitation(
  db: D1Database,
  env: CloudflareEnv,
  request: Request,
  invitation: { boardId: string; email: string; role: 'editor' | 'viewer'; invitedBy: string },
  existingOnly: boolean,
) {
  const board = await db.prepare('SELECT title FROM boards WHERE id = ?')
    .bind(invitation.boardId)
    .first<{ title: string }>();
  if (!board) return NextResponse.json({ success: false, message: 'Board not found.' }, { status: 404 });

  const settings = getVerificationEmailSettings(env);
  const appUrl = getEmailAppUrl(request, settings.appUrl);
  if (!appUrl) {
    return NextResponse.json({ success: false, message: 'Invitation email is not configured on this server.' }, { status: 503 });
  }

  await db.prepare('DELETE FROM board_invitations WHERE expires_at <= ?')
    .bind(new Date().toISOString())
    .run();
  const pending = await db.prepare(`
    SELECT token_hash, role, invited_by, expires_at, created_at
    FROM board_invitations WHERE board_id = ? AND email = ?
  `).bind(invitation.boardId, invitation.email).first<{
    token_hash: string;
    role: 'editor' | 'viewer';
    invited_by: string;
    expires_at: string;
    created_at: string;
  }>();
  if (existingOnly && !pending) {
    return NextResponse.json({ success: false, message: 'Pending invitation not found.' }, { status: 404 });
  }
  if (!existingOnly && pending) {
    return NextResponse.json({ success: false, message: 'An invitation is already pending for this email.' }, { status: 409 });
  }

  const membership = await db.prepare(`
    SELECT u.id FROM users u
    LEFT JOIN board_members bm ON bm.user_id = u.id AND bm.board_id = ?
    WHERE LOWER(u.email) = ? AND (bm.user_id IS NOT NULL OR u.id = (
      SELECT owner_id FROM boards WHERE id = ?
    ))
  `).bind(invitation.boardId, invitation.email, invitation.boardId).first<{ id: string }>();
  if (membership) {
    return NextResponse.json({ success: false, message: 'This user is already a board member.' }, { status: 409 });
  }

  const token = crypto.randomUUID();
  const tokenHash = await hashInvitationToken(token);
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + INVITATION_DURATION_MS).toISOString();
  if (existingOnly) {
    await db.prepare(`
      UPDATE board_invitations
      SET token_hash = ?, role = ?, invited_by = ?, expires_at = ?, created_at = ?
      WHERE board_id = ? AND email = ?
    `).bind(tokenHash, invitation.role, invitation.invitedBy, expiresAt, createdAt, invitation.boardId, invitation.email).run();
  } else {
    await db.prepare(`
      INSERT INTO board_invitations (token_hash, board_id, email, role, invited_by, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(tokenHash, invitation.boardId, invitation.email, invitation.role, invitation.invitedBy, expiresAt, createdAt).run();
  }

  try {
    const emailSent = await sendBoardInvitationEmail(
      settings.apiKey,
      settings.from,
      invitation.email,
      board.title,
      invitation.role,
      createInvitationUrl(appUrl, token),
    );
    return NextResponse.json({
      success: true,
      message: emailSent
        ? `Invitation sent to ${invitation.email} as ${invitation.role}.`
        : `Development invitation link was printed to the server console for ${invitation.email}.`,
    });
  } catch (error) {
    console.error('Failed to send board invitation email:', error);
    if (pending) {
      await db.prepare(`
        UPDATE board_invitations
        SET token_hash = ?, role = ?, invited_by = ?, expires_at = ?, created_at = ?
        WHERE board_id = ? AND email = ?
      `).bind(
        pending.token_hash,
        pending.role,
        pending.invited_by,
        pending.expires_at,
        pending.created_at,
        invitation.boardId,
        invitation.email,
      ).run();
    } else {
      await db.prepare('DELETE FROM board_invitations WHERE token_hash = ?').bind(tokenHash).run();
    }
    return NextResponse.json({ success: false, message: 'Unable to send the invitation email. Please try again.' }, { status: 502 });
  }

}

async function handleInvitation(request: Request, existingOnly: boolean) {
  let body: InvitationRequest;
  try {
    body = await request.json() as InvitationRequest;
  } catch {
    return NextResponse.json({ success: false, message: 'A valid JSON request body is required.' }, { status: 400 });
  }

  if (typeof body.boardId !== 'string' || !body.boardId.trim() ||
    typeof body.email !== 'string' || !isValidInvitationEmail(body.email) ||
    (body.role !== 'editor' && body.role !== 'viewer')) {
    return NextResponse.json({ success: false, message: 'A board, valid email, and editor or viewer role are required.' }, { status: 400 });
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    const userId = await getSessionUserId(env.DB, request);
    if (!userId) return NextResponse.json({ success: false, message: 'Authentication is required.' }, { status: 401 });
    if (!await isBoardOwner(env.DB, body.boardId, userId)) {
      return NextResponse.json({ success: false, message: 'Only the board owner can manage invitations.' }, { status: 403 });
    }
    const email = normalizeInvitationEmail(body.email);
    return await sendInvitation(env.DB, env, request, {
      boardId: body.boardId,
      email,
      role: body.role,
      invitedBy: userId,
    }, existingOnly);
  } catch (error) {
    console.error('Board invitation request failed:', error);
    return NextResponse.json({ success: false, message: 'Unable to process the invitation.' }, { status: 500 });
  }
}

export function POST(request: Request) {
  return handleInvitation(request, false);
}

export function PATCH(request: Request) {
  return handleInvitation(request, true);
}

export async function DELETE(request: Request) {
  let body: InvitationRequest;
  try {
    body = await request.json() as InvitationRequest;
  } catch {
    return NextResponse.json({ success: false, message: 'A valid JSON request body is required.' }, { status: 400 });
  }
  if (typeof body.boardId !== 'string' || !body.boardId.trim() ||
    typeof body.email !== 'string' || !isValidInvitationEmail(body.email)) {
    return NextResponse.json({ success: false, message: 'A board and valid email are required.' }, { status: 400 });
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    const userId = await getSessionUserId(env.DB, request);
    if (!userId) return NextResponse.json({ success: false, message: 'Authentication is required.' }, { status: 401 });
    if (!await isBoardOwner(env.DB, body.boardId, userId)) {
      return NextResponse.json({ success: false, message: 'Only the board owner can manage invitations.' }, { status: 403 });
    }
    const result = await env.DB.prepare('DELETE FROM board_invitations WHERE board_id = ? AND email = ?')
      .bind(body.boardId, normalizeInvitationEmail(body.email))
      .run();
    if (!result.meta.changes) return NextResponse.json({ success: false, message: 'Pending invitation not found.' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Invitation revoked.' });
  } catch (error) {
    console.error('Invitation revoke failed:', error);
    return NextResponse.json({ success: false, message: 'Unable to revoke the invitation.' }, { status: 500 });
  }
}
