import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const verification = await readFile(
  new URL('../docs/DB-TRANSACTION-VERIFICATION.md', import.meta.url),
  'utf8',
);
const migration = await readFile(
  new URL(
    '../supabase/migrations/20260912202457_persist_terminal_order_shipping_lock.sql',
    import.meta.url,
  ),
  'utf8',
);

test('repo migration persists the live terminal shipping trigger contract', () => {
  assert.match(migration, /create or replace function private\.protect_terminal_order_shipping_fields\(\)/i);
  assert.match(migration, /set search_path = ''/i);
  assert.match(migration, /old\.status in \('cancelled', 'delivered'\)/i);
  assert.match(migration, /new\.status in \('cancelled', 'delivered'\)/i);
  for (const field of ['shipping_carrier', 'tracking_number', 'tracking_url', 'shipped_at']) {
    assert.match(migration, new RegExp(`old\\.${field} is distinct from new\\.${field}`, 'i'));
  }
  assert.match(migration, /before update of shipping_carrier, tracking_number, tracking_url, shipped_at, status/i);
});

test('DB verification records terminal shipping fields as immutable', () => {
  assert.match(verification, /protected terminal states are `cancelled` and `delivered`/);
  assert.match(verification, /`shipping_carrier`, `tracking_number`, `tracking_url` or `shipped_at`/);
  assert.match(verification, /blocked by the database trigger/);
});

test('DB verification distinguishes transaction evidence from browser E2E', () => {
  assert.match(
    verification,
    /real database\/RPC transaction tests, not authenticated browser E2E tests/,
  );
});
