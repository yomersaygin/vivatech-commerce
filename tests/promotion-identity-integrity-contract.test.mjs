import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const migration = await readFile(new URL('../supabase/migrations/20260913203800_enforce_promotion_identity_text.sql', import.meta.url), 'utf8');
const verification = await readFile(new URL('../docs/DB-TRANSACTION-VERIFICATION.md', import.meta.url), 'utf8');
test('campaign identity and coupon codes are canonical at the DB boundary', () => {
  assert.match(migration, /campaigns_title_nonblank_check/i);
  assert.match(migration, /campaigns_slug_format_check/i);
  assert.match(migration, /coupons_code_format_check/i);
  assert.match(migration, /code = upper\(code\)/i);
  assert.match(migration, /\^\[A-Z0-9\]\+\(\[_-\]\[A-Z0-9\]\+\)\*\$/);
});
test('promotion live rollback evidence is separate from source contracts', () => {
  assert.match(verification, /Promotion identity text integrity/);
  assert.match(verification, /authenticated-admin rollback probes/i);
  assert.match(verification, /separate repository source contract test/i);
  assert.match(verification, /not a browser E2E test/i);
});
