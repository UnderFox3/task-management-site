const PBKDF2_PREFIX = 'pbkdf2_sha256';

function toHex(bytes) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex) {
  const bytes = new Uint8Array(Math.ceil(hex.length / 2));
  for (let index = 0; index < hex.length; index += 2) {
    bytes[index / 2] = Number.parseInt(hex.slice(index, index + 2), 16);
  }
  return bytes;
}

export function getEffectiveRole(userId, members, visibility = 'private', ownerId = null) {
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

export function canAccessBoard(userId, visibility, members, ownerId = null) {
  if (visibility === 'public') {
    return true;
  }
  if (!userId) return false;
  return Boolean(getEffectiveRole(userId, members, visibility, ownerId));
}

export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derived = await crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt,
    iterations: 220000,
    hash: 'SHA-256',
  }, key, 256);

  return `${PBKDF2_PREFIX}$220000$${toHex(salt)}$${toHex(new Uint8Array(derived))}`;
}

export async function verifyPassword(password, storedHash) {
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
  const hashBuffer = await crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt: fromHex(saltHex),
    iterations,
    hash: 'SHA-256',
  }, key, 256);

  return toHex(new Uint8Array(hashBuffer)) === expectedHex;
}
