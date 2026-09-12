import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(new URL('../supabase/migrations/20260912213430_prevent_category_hierarchy_cycles.sql', import.meta.url), 'utf8');
const verification = await readFile(new URL('../docs/DB-TRANSACTION-VERIFICATION.md', import.meta.url), 'utf8');

test('category parent changes are serialized and checked recursively', () => {
  assert.match(migration, /pg_advisory_xact_lock/i);
  assert.match(migration, /with recursive ancestors/i);
  assert.match(migration, /where id = new\.id/i);
  assert.match(migration, /before insert or update of parent_id on public\.categories/i);
});

test('direct self-parenting is rejected by the database trigger', () => {
  assert.match(migration, /if new\.parent_id = new\.id then/i);
  assert.match(migration, /cannot be its own parent/i);
});

test('DB verification records real rollback probes separately from browser E2E', () => {
  assert.match(verification, /Category hierarchy cycle prevention/);
  assert.match(verification, /Real rollback-only live database verification/i);
  assert.match(verification, /not a browser E2E test/i);
});
