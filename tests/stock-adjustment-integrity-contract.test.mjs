import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(new URL('../supabase/migrations/20260912212731_enforce_audited_stock_adjustments.sql', import.meta.url), 'utf8');
const verification = await readFile(new URL('../docs/DB-TRANSACTION-VERIFICATION.md', import.meta.url), 'utf8');

test('direct product stock updates are removed from client roles', () => {
  assert.match(migration, /revoke update on table public\.products from anon, authenticated/i);
  assert.match(migration, /grant update \([\s\S]*name[\s\S]*is_active[\s\S]*\) on table public\.products to authenticated/i);
  assert.doesNotMatch(migration.match(/grant update \([\s\S]*?\) on table public\.products/i)?.[0] || '', /stock_quantity/i);
});

test('admin stock RPC locks product and writes matching adjustment history', () => {
  assert.match(migration, /create or replace function public\.admin_adjust_product_stock/i);
  assert.match(migration, /if not public\.is_admin\(\)/i);
  assert.match(migration, /from public\.products where id = p_product_id for update/i);
  assert.match(migration, /case when v_delta > 0 then 'adjustment_in' else 'adjustment_out' end/i);
  assert.match(migration, /abs\(v_delta\)/i);
});

test('initial stock creates opening history', () => {
  assert.match(migration, /create trigger trg_record_initial_product_stock/i);
  assert.match(migration, /'opening', new\.stock_quantity, 'product', new\.id/i);
});

test('DB verification records real rollback tests separately from browser E2E', () => {
  assert.match(verification, /Audited product stock adjustments/);
  assert.match(verification, /rollback-only live database verification/i);
  assert.match(verification, /not a browser E2E test/i);
});
