import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(
  new URL('../supabase/migrations/20260913202800_enforce_product_identity_text.sql', import.meta.url),
  'utf8',
);
const verification = await readFile(
  new URL('../docs/DB-TRANSACTION-VERIFICATION.md', import.meta.url),
  'utf8',
);

test('product names are trimmed and nonblank at the database boundary', () => {
  assert.match(migration, /add constraint products_name_nonblank_check/i);
  assert.match(migration, /name = btrim\(name\)/i);
  assert.match(migration, /name <> ''/i);
});

test('product slugs use the canonical lowercase hyphenated format', () => {
  assert.match(migration, /add constraint products_slug_format_check/i);
  assert.match(migration, /slug = btrim\(slug\)/i);
  assert.match(migration, /\^\[a-z0-9\]\+\(-\[a-z0-9\]\+\)\*\$/i);
});

test('product identity live rollback evidence stays distinct from source contracts', () => {
  assert.match(verification, /Product identity text integrity/);
  assert.match(verification, /authenticated-admin rollback probe/i);
  assert.match(verification, /separate repository source contract test/i);
  assert.match(verification, /not a browser E2E test/i);
});
