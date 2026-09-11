import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const verification = await readFile(
  new URL('../docs/DB-TRANSACTION-VERIFICATION.md', import.meta.url),
  'utf8',
);

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
