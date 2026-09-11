import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/app/account/profile/page.tsx', import.meta.url), 'utf8');

test('profile resolves the signed-in auth user first', () => {
  assert.match(source, /supabase\.auth\.getUser\(\)/);
});

test('profile loads the customer by auth_user_id', () => {
  assert.match(source, /from\('customers'\).*?eq\('auth_user_id',user\.user\.id\)/s);
});

test('profile updates only the resolved customer id', () => {
  assert.match(source, /from\('customers'\)\.update\(\{first_name:firstName,last_name:lastName,phone:phone\|\|null\}\)\.eq\('id',profile\.id\)/s);
});

test('profile does not attempt to update auth ownership fields', () => {
  const updateCall = source.match(/from\('customers'\)\.update\((\{.*?\})\)\.eq\('id',profile\.id\)/s)?.[1] ?? '';
  assert.equal(updateCall.includes('auth_user_id'), false);
});

test('profile keeps email read-only and requires name fields', () => {
  assert.match(source, /<input value=\{email\} disabled\/?>/);
  assert.match(source, /<input required name="first_name"/);
  assert.match(source, /<input required name="last_name"/);
});
