import { Resend } from 'resend';
import { isDevelopmentEmailMode } from './email-verification';

export const INVITATION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export function normalizeInvitationEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidInvitationEmail(email: string): boolean {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function createInvitationUrl(appUrl: string, token: string): string {
  const baseUrl = new URL(appUrl);
  if (
    (baseUrl.protocol !== 'https:' &&
      baseUrl.hostname !== 'localhost' &&
      baseUrl.hostname !== '127.0.0.1' &&
      baseUrl.hostname !== '[::1]') ||
    baseUrl.username ||
    baseUrl.password
  ) {
    throw new Error('APP_URL must be an HTTPS URL without embedded credentials.');
  }
  const invitationUrl = new URL('/invitations/accept', baseUrl);
  invitationUrl.searchParams.set('token', token);
  return invitationUrl.toString();
}

export async function sendBoardInvitationEmail(
  apiKey: string | undefined,
  from: string,
  to: string,
  boardTitle: string,
  role: 'editor' | 'viewer',
  invitationUrl: string,
): Promise<boolean> {
  if (isDevelopmentEmailMode(invitationUrl)) {
    console.info('DEV INVITATION LINK:', invitationUrl);
    return false;
  }
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is required to send invitation emails in production.');
  }

  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to,
    subject: `Invitation to collaborate on ${boardTitle}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
      <h2>You have been invited to a board</h2>
      <p>You have been invited to join <strong>${escapeHtml(boardTitle)}</strong> as a ${role}.</p>
      <p><a href="${escapeHtml(invitationUrl)}">Accept invitation</a></p>
      <p>This invitation expires in 7 days. If you did not expect this invitation, you can ignore this email.</p>
    </div>`,
  });
  if (result.error) {
    throw new Error(`Resend rejected the invitation email: ${result.error.message}`);
  }
  return true;
}

export async function hashInvitationToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}
