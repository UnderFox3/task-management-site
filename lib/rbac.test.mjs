import test from 'node:test';
import assert from 'node:assert/strict';

import { hashPassword, verifyPassword, canAccessBoard, getEffectiveRole } from './rbac.mjs';

test('password hashing and verification work', async () => {
  const password = 'SecurePass!123';
  const hash = await hashPassword(password);
  assert.notEqual(hash, password);
  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword('WrongPass!123', hash), false);
});

test('board access and role resolution work for private collaboration', async () => {
  const members = {
    owner: { role: 'owner' },
    editor: { role: 'editor' },
    viewer: { role: 'viewer' },
  };

  assert.equal(canAccessBoard('owner', 'private', members), true);
  assert.equal(canAccessBoard('editor', 'private', members), true);
  assert.equal(canAccessBoard('viewer', 'private', members), true);
  assert.equal(canAccessBoard('guest', 'private', members), false);
  assert.equal(canAccessBoard('owner', 'public', members), true);
  assert.equal(canAccessBoard('guest', 'public', members), false);
  assert.equal(getEffectiveRole('owner', members), 'owner');
  assert.equal(getEffectiveRole('missing', members), null);
});
