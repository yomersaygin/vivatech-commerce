import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(new URL('../supabase/migrations/20260912215351_restrict_public_content_link_schemes.sql', import.meta.url), 'utf8');
const verification = await readFile(new URL('../docs/DB-TRANSACTION-VERIFICATION.md', import.meta.url), 'utf8');

test('banner and content links accept only explicit safe destinations', () => {
  assert.match(migration, /site_banners_safe_link_url_check/i);
  assert.match(migration, /content_blocks_safe_link_url_check/i);
  assert.match(migration, /\^https\?:\/\/\[\^\[:space:\]\]\+\$/i);
  assert.match(migration, /left\(link_url, 2\) <> '\/\/'/i);
  assert.match(migration, /left\(link_url, 1\) = '#'/i);
});

test('live rollback evidence remains separate from source contract evidence', () => {
  assert.match(verification, /Public content link scheme protection/);
  assert.match(verification, /Real rollback-only live database verification/i);
  assert.match(verification, /separate repository source contract test/i);
  assert.match(verification, /not a browser E2E test/i);
});
