import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(
  new URL(
    '../supabase/migrations/20260912204409_protect_coupon_financial_history.sql',
    import.meta.url,
  ),
  'utf8',
);
const verification = await readFile(
  new URL('../docs/DB-TRANSACTION-VERIFICATION.md', import.meta.url),
  'utf8',
);

test('coupon redemption history denies direct client writes', () => {
  assert.match(
    migration,
    /revoke insert, update, delete, truncate, references, trigger[\s\S]*on table public\.coupon_redemptions[\s\S]*from anon, authenticated/i,
  );
});

test('order coupon relation uses restrictive deletion semantics', () => {
  assert.match(migration, /drop constraint orders_coupon_id_fkey/i);
  assert.match(
    migration,
    /foreign key \(coupon_id\)[\s\S]*references public\.coupons\(id\)[\s\S]*on delete restrict/i,
  );
  assert.doesNotMatch(migration, /on delete set null/i);
});

test('DB verification separates real coupon transaction evidence from browser E2E', () => {
  assert.match(verification, /Coupon redemption and financial-history protection/);
  assert.match(verification, /All coupon probes were rollback-only/i);
  assert.match(verification, /not browser E2E evidence/i);
});
