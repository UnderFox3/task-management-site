export type BoardVisibility = 'public' | 'private';
export type BoardAccessRole = 'owner' | 'editor' | 'viewer';

export type BoardMemberRecord = Record<string, { userId: string; role: BoardAccessRole; invitedAt: string }>;

const PBKDF2_PREFIX = 'pbkdf2_sha256';

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(Math.ceil(hex.length / 2));
  for (let index = 0; index < hex.length; index += 2) {
    bytes[index / 2] = Number.parseInt(hex.slice(index, index + 2), 16);
  }
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function getEffectiveRole(
  userId: string | null,
  members?: BoardMemberRecord | Record<string, { role: BoardAccessRole }>,
  visibility: BoardVisibility = 'private',
  ownerId?: string | null
): BoardAccessRole | null {
  if (!userId) {
    return visibility === 'public' ? 'viewer' : null;
  }

  if (ownerId && userId === ownerId) {
    return 'owner';
  }

  const member = members?.[userId];
  if (member?.role) {
    return member.role;
  }

  return visibility === 'public' ? 'viewer' : null;
}

export function canAccessBoard(
  userId: string | null,
  visibility: BoardVisibility,
  members?: BoardMemberRecord | Record<string, { role: BoardAccessRole }>,
  ownerId?: string | null
): boolean {
  if (visibility === 'public') {
    return true;
  }
  if (!userId) return false;

  const role = getEffectiveRole(userId, members, visibility, ownerId);
  return Boolean(role);
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 220000,
      hash: 'SHA-256',
    },
    key,
    256
  );

  return `${PBKDF2_PREFIX}$220000$${toHex(salt)}$${toHex(new Uint8Array(derived))}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash || !storedHash.startsWith(`${PBKDF2_PREFIX}$`)) {
    return false;
  }

  const parts = storedHash.split('$');
  if (parts.length !== 4) {
    return false;
  }

  const [, iterationsValue, saltHex, expectedHex] = parts;
  const iterations = Number.parseInt(iterationsValue, 10);
  if (!Number.isFinite(iterations) || iterations <= 0) {
    return false;
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(fromHex(saltHex)),
      iterations,
      hash: 'SHA-256',
    },
    key,
    256
  );

  const actualHex = toHex(new Uint8Array(hashBuffer));
  return actualHex === expectedHex;
}

export { normalizeEmail };
