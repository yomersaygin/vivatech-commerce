import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(
  new URL(
    '../supabase/migrations/20260912210409_protect_customer_email_identity.sql',
    import.meta.url,
  ),
  'utf8',
);
const profile = await readFile(
  new URL('../src/app/account/profile/page.tsx', import.meta.url),
  'utf8',
);
const verification = await readFile(
  new URL('../docs/DB-TRANSACTION-VERIFICATION.md', import.meta.url),
  'utf8',
);

test('customer identity email cannot be updated through the profile table', () => {
  assert.match(
    migration,
    /revoke update \(email\) on table public\.customers from anon, authenticated/i,
  );
});

test('profile UI keeps identity and ownership fields out of update payloads', () => {
  assert.match(profile, /<input value=\{email\} disabled\/>/i);
  assert.doesNotMatch(profile, /update\(\{[^}]*email\s*:/s);
  assert.doesNotMatch(profile, /update\(\{[^}]*auth_user_id\s*:/s);
});

test('DB verification separates real ownership probes from browser E2E', () => {
  assert.match(verification, /Customer identity and address ownership/);
  assert.match(verification, /rollback-only authenticated database test/i);
  assert.match(verification, /not a browser E2E test/i);
});
