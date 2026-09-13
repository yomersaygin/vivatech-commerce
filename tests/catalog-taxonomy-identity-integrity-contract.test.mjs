import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(
  new URL('../supabase/migrations/20260913203300_enforce_catalog_taxonomy_identity_text.sql', import.meta.url),
  'utf8',
);
const verification = await readFile(
  new URL('../docs/DB-TRANSACTION-VERIFICATION.md', import.meta.url),
  'utf8',
);

for (const table of ['categories', 'brands']) {
  test(`${table} names are trimmed and nonblank`, () => {
    assert.match(migration, new RegExp(`add constraint ${table}_name_nonblank_check`, 'i'));
    assert.match(migration, /name = btrim\(name\)/i);
    assert.match(migration, /name <> ''/i);
  });

  test(`${table} slugs use the canonical lowercase hyphenated format`, () => {
    assert.match(migration, new RegExp(`add constraint ${table}_slug_format_check`, 'i'));
    assert.match(migration, /slug = btrim\(slug\)/i);
    assert.match(migration, /\^\[a-z0-9\]\+\(-\[a-z0-9\]\+\)\*\$/i);
  });
}

test('taxonomy identity rollback evidence stays distinct from source contracts', () => {
  assert.match(verification, /Catalog taxonomy identity text integrity/);
  assert.match(verification, /authenticated-admin rollback probes/i);
  assert.match(verification, /separate repository source contract test/i);
  assert.match(verification, /not a browser E2E test/i);
});
