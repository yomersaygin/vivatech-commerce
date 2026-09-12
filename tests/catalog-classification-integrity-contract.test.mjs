import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(new URL('../supabase/migrations/20260912213949_protect_catalog_classification_references.sql', import.meta.url), 'utf8');
const verification = await readFile(new URL('../docs/DB-TRANSACTION-VERIFICATION.md', import.meta.url), 'utf8');

test('used categories and brands cannot silently detach from products', () => {
  assert.match(migration, /foreign key \(category_id\)[\s\S]*references public\.categories\(id\)[\s\S]*on delete restrict/i);
  assert.match(migration, /foreign key \(brand_id\)[\s\S]*references public\.brands\(id\)[\s\S]*on delete restrict/i);
  assert.doesNotMatch(migration, /on delete set null/i);
});

test('parent categories cannot silently flatten their children', () => {
  assert.match(migration, /foreign key \(parent_id\)[\s\S]*references public\.categories\(id\)[\s\S]*on delete restrict/i);
});

test('live rollback evidence and source contract evidence remain distinct', () => {
  assert.match(verification, /Catalog classification reference protection/);
  assert.match(verification, /Real rollback-only live database verification/i);
  assert.match(verification, /separate repository source contract test/i);
  assert.match(verification, /not a browser E2E test/i);
});
