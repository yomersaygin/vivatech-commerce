import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(new URL('../supabase/migrations/20260913200347_enforce_compare_price_above_sale_price.sql', import.meta.url), 'utf8');
const verification = await readFile(new URL('../docs/DB-TRANSACTION-VERIFICATION.md', import.meta.url), 'utf8');

test('compare-at price is null or strictly above the sale price', () => {
  assert.match(migration, /drop constraint products_compare_at_price_check/i);
  assert.match(migration, /add constraint products_compare_at_price_check/i);
  assert.match(migration, /compare_at_price is null/i);
  assert.match(migration, /compare_at_price > price/i);
});

test('compare-price live rollback evidence stays distinct from source contracts', () => {
  assert.match(verification, /Product compare-price integrity/);
  assert.match(verification, /Real rollback-only live database verification/i);
  assert.match(verification, /separate repository source contract test/i);
  assert.match(verification, /not a browser E2E test/i);
});
