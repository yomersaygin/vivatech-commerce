import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const migration = await readFile(new URL('../supabase/migrations/20260913204300_enforce_public_content_titles.sql', import.meta.url), 'utf8');
const verification = await readFile(new URL('../docs/DB-TRANSACTION-VERIFICATION.md', import.meta.url), 'utf8');
test('public content titles are trimmed and nonblank', () => {
  assert.match(migration, /site_banners_title_nonblank_check/i);
  assert.match(migration, /content_blocks_title_nonblank_check/i);
  assert.match(migration, /title = btrim\(title\)/i);
  assert.match(migration, /title <> ''/i);
});
test('public content title rollback evidence is separate from source contracts', () => {
  assert.match(verification, /Public content title integrity/);
  assert.match(verification, /authenticated-admin rollback probes/i);
  assert.match(verification, /separate repository source contract test/i);
  assert.match(verification, /not a browser E2E test/i);
});
