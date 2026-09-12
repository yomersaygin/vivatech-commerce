import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(
  new URL(
    '../supabase/migrations/20260912211004_lock_admin_membership_writes.sql',
    import.meta.url,
  ),
  'utf8',
);
const verification = await readFile(
  new URL('../docs/DB-TRANSACTION-VERIFICATION.md', import.meta.url),
  'utf8',
);

test('admin membership denies every client write class', () => {
  assert.match(
    migration,
    /revoke insert, update, delete, truncate, references, trigger[\s\S]*on table public\.admin_users[\s\S]*from anon, authenticated/i,
  );
  assert.doesNotMatch(migration, /revoke[^;]*select/i);
});

test('DB verification records real privilege-escalation probes', () => {
  assert.match(verification, /Admin membership privilege boundary/);
  assert.match(verification, /INSERT, UPDATE, DELETE and TRUNCATE/i);
  assert.match(verification, /rollback-only authenticated database test/i);
  assert.match(verification, /not a browser E2E test/i);
});
