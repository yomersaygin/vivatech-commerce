import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(
  new URL('../supabase/migrations/20260912211520_make_admin_bootstrap_single_use.sql', import.meta.url),
  'utf8',
);
const verification = await readFile(
  new URL('../docs/DB-TRANSACTION-VERIFICATION.md', import.meta.url),
  'utf8',
);

test('first-admin bootstrap uses a persistent single-use latch', () => {
  assert.match(migration, /create table if not exists private\.admin_bootstrap_state/i);
  assert.match(migration, /primary key default true check \(singleton\)/i);
  assert.match(migration, /where singleton = true and consumed = false/i);
  assert.match(migration, /returning true into v_claimed/i);
  assert.doesNotMatch(migration, /if not exists \(select 1 from public\.admin_users\)/i);
});

test('bootstrap state and trigger function deny public client access', () => {
  assert.match(migration, /revoke all on table private\.admin_bootstrap_state from public, anon, authenticated/i);
  assert.match(migration, /create policy admin_bootstrap_state_no_client_access/i);
  assert.match(migration, /as restrictive[\s\S]*using \(false\)[\s\S]*with check \(false\)/i);
  assert.match(migration, /revoke all on function public\.bootstrap_first_admin\(\) from public, anon, authenticated/i);
  assert.match(migration, /security definer[\s\S]*set search_path = ''/i);
});

test('DB verification records real admin-boundary tests without claiming browser E2E', () => {
  assert.match(verification, /Single-use first-admin bootstrap/);
  assert.match(verification, /rollback-only authenticated database verification/i);
  assert.match(verification, /not a browser E2E test/i);
});
