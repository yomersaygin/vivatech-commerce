import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(new URL('../supabase/migrations/20260913092421_enforce_site_banner_date_order.sql', import.meta.url), 'utf8');
const verification = await readFile(new URL('../docs/DB-TRANSACTION-VERIFICATION.md', import.meta.url), 'utf8');

test('site banner date ranges cannot end before they start', () => {
  assert.match(migration, /alter table public\.site_banners/i);
  assert.match(migration, /site_banners_date_check/i);
  assert.match(migration, /starts_at is null/i);
  assert.match(migration, /ends_at is null/i);
  assert.match(migration, /starts_at <= ends_at/i);
});

test('banner date live rollback evidence stays distinct from source contract evidence', () => {
  assert.match(verification, /Site banner date-order integrity/);
  assert.match(verification, /Real rollback-only live database verification/i);
  assert.match(verification, /separate repository source contract test/i);
  assert.match(verification, /not a browser E2E test/i);
});
