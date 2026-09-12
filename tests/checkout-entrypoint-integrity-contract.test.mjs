import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(
  new URL(
    '../supabase/migrations/20260912205151_retire_legacy_checkout_rpcs.sql',
    import.meta.url,
  ),
  'utf8',
);
const checkout = await readFile(
  new URL('../src/app/checkout/page.tsx', import.meta.url),
  'utf8',
);
const verification = await readFile(
  new URL('../docs/DB-TRANSACTION-VERIFICATION.md', import.meta.url),
  'utf8',
);

test('legacy checkout RPCs deny public client execution', () => {
  for (const signature of [
    /create_order_with_stock\(text, uuid, uuid, uuid, integer\)/i,
    /create_customer_order_with_stock\(text, uuid, jsonb, text\)/i,
    /create_customer_order_with_stock_v2\(text, uuid, jsonb, text, text\)/i,
  ]) {
    assert.match(migration, signature);
  }
  assert.equal(
    (migration.match(/from public, anon, authenticated/gi) || []).length,
    3,
  );
});

test('application checkout continues to use only V3', () => {
  assert.match(checkout, /rpc\('create_customer_order_with_stock_v3'/);
  assert.doesNotMatch(checkout, /rpc\('create_order_with_stock'/);
  assert.doesNotMatch(checkout, /rpc\('create_customer_order_with_stock'/);
  assert.doesNotMatch(checkout, /rpc\('create_customer_order_with_stock_v2'/);
});

test('DB verification records rollback-only V3 regression separately from browser E2E', () => {
  assert.match(verification, /Legacy checkout entry-point retirement/);
  assert.match(verification, /rollback-only authenticated V3 regression/i);
  assert.match(verification, /not a browser E2E test/i);
});
