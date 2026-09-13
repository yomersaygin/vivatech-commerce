import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const migration = await readFile(new URL('../supabase/migrations/20260913204800_enforce_product_image_metadata.sql', import.meta.url), 'utf8');
const verification = await readFile(new URL('../docs/DB-TRANSACTION-VERIFICATION.md', import.meta.url), 'utf8');
test('product image metadata rejects blank URLs and negative positions', () => {
  assert.match(migration, /product_images_url_nonblank_check/i);
  assert.match(migration, /image_url = btrim\(image_url\)/i);
  assert.match(migration, /image_url <> ''/i);
  assert.match(migration, /product_images_sort_order_nonnegative_check/i);
  assert.match(migration, /sort_order >= 0/i);
});
test('image metadata rollback evidence is separate from source contracts', () => {
  assert.match(verification, /Product image metadata integrity/);
  assert.match(verification, /authenticated-admin rollback probes/i);
  assert.match(verification, /separate repository source contract test/i);
  assert.match(verification, /not a browser E2E test/i);
});
