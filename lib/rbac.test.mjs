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

  // Public boards should be accessible to anyone logged in or viewing
  assert.equal(canAccessBoard('owner', 'public', members), true);
  assert.equal(canAccessBoard('guest', 'public', members), true);
  assert.equal(canAccessBoard(null, 'public', members), true);

  // Effective roles
  assert.equal(getEffectiveRole('owner', members, 'private'), 'owner');
  assert.equal(getEffectiveRole('editor', members, 'private'), 'editor');
  assert.equal(getEffectiveRole('viewer', members, 'private'), 'viewer');
  assert.equal(getEffectiveRole('guest', members, 'private'), null);

  // For public boards, guest gets 'viewer' by default
  assert.equal(getEffectiveRole('guest', members, 'public'), 'viewer');
  assert.equal(getEffectiveRole('owner', members, 'public'), 'owner');

  // Owners should retain access even when the owner record is omitted from members.
  assert.equal(canAccessBoard('owner', 'private', {}, 'owner'), true);
  assert.equal(getEffectiveRole('owner', {}, 'private', 'owner'), 'owner');
  assert.equal(getEffectiveRole('guest', {}, 'private'), null);
});
