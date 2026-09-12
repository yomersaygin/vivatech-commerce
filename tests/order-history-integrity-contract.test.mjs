import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(
  new URL(
    '../supabase/migrations/20260912203627_lock_order_items_and_stock_movements.sql',
    import.meta.url,
  ),
  'utf8',
);
const verification = await readFile(
  new URL('../docs/DB-TRANSACTION-VERIFICATION.md', import.meta.url),
  'utf8',
);

test('order items and stock movements deny direct history writes', () => {
  for (const table of ['order_items', 'stock_movements']) {
    assert.match(
      migration,
      new RegExp(
        `revoke insert, update, delete, truncate, references, trigger[\\s\\S]*on table public\\.${table}[\\s\\S]*from anon, authenticated`,
        'i',
      ),
    );
  }
});

test('DB verification records real rollback-only history manipulation tests', () => {
  assert.match(verification, /Order-item and stock-movement history protection/);
  assert.match(verification, /all six direct write attempts were rejected/i);
  assert.match(verification, /not a browser E2E test/i);
  assert.match(verification, /V3 checkout still created one order item and one `sale` stock movement/);
  assert.match(verification, /exactly one `return_in` movement with `reference_type = order_cancel`/);
});
