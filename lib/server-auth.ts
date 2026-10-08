const SESSION_COOKIE = 'itask_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30;

async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return value.join('=') || null;
  }
  return null;
}

export async function createSession(db: D1Database, userId: string): Promise<string> {
  const token = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_SECONDS * 1000).toISOString();

  await db.prepare(
    'INSERT INTO auth_sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)',
  ).bind(await hashToken(token), userId, expiresAt, now.toISOString()).run();

  return token;
}

export async function getSessionUserId(db: D1Database, request: Request): Promise<string | null> {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return null;

  const tokenHash = await hashToken(token);
  const now = new Date().toISOString();
  const session = await db.prepare(
    'SELECT user_id FROM auth_sessions WHERE token_hash = ? AND expires_at > ?',
  ).bind(tokenHash, now).first<{ user_id: string }>();

  if (!session) {
    await db.prepare('DELETE FROM auth_sessions WHERE token_hash = ?').bind(tokenHash).run();
    return null;
  }
  return session.user_id;
}

export async function deleteSession(db: D1Database, request: Request): Promise<void> {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return;
  await db.prepare('DELETE FROM auth_sessions WHERE token_hash = ?')
    .bind(await hashToken(token))
    .run();
}

export function sessionCookie(token: string, request: Request): string {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DURATION_SECONDS}${secure}`;
}

export function expiredSessionCookie(request: Request): string {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
