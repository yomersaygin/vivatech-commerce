import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(new URL('../supabase/migrations/20260912214840_enforce_single_primary_product_image.sql', import.meta.url), 'utf8');
const verification = await readFile(new URL('../docs/DB-TRANSACTION-VERIFICATION.md', import.meta.url), 'utf8');

test('database permits at most one primary image per product', () => {
  assert.match(migration, /create unique index product_images_one_primary_per_product_uidx/i);
  assert.match(migration, /on public\.product_images \(product_id\)/i);
  assert.match(migration, /where is_primary = true/i);
});

test('live rollback evidence remains separate from source contract evidence', () => {
  assert.match(verification, /Single primary product image/);
  assert.match(verification, /Real rollback-only live database verification/i);
  assert.match(verification, /separate repository source contract test/i);
  assert.match(verification, /not a browser E2E test/i);
});
