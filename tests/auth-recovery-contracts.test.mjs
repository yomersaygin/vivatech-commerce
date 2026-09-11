import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const account = await readFile(new URL('../src/app/account/page.tsx', import.meta.url), 'utf8');
const reset = await readFile(new URL('../src/app/account/reset-password/page.tsx', import.meta.url), 'utf8');

test('signup confirmation returns to the stable account route', () => {
  assert.match(account, /emailRedirectTo:`\$\{SITE_URL\}\/account`/);
});

test('password reset email targets the dedicated recovery route', () => {
  assert.match(account, /resetPasswordForEmail\(email,\{redirectTo:`\$\{SITE_URL\}\/account\/reset-password`\}\)/);
});

test('auth screens map rate-limit and login errors to user friendly messages', () => {
  assert.match(account, /email rate limit exceeded/);
  assert.match(account, /invalid login credentials/);
  assert.match(account, /email not confirmed/);
});

test('reset page requires a recovery session before password update', () => {
  assert.match(reset, /if\(!ready\|\|busy\)return/);
  assert.match(reset, /event==='PASSWORD_RECOVERY'/);
  assert.match(reset, /updateUser\(\{password\}\)/);
});

test('reset page validates password length and confirmation match', () => {
  assert.match(reset, /password\.length<6/);
  assert.match(reset, /password!==confirm/);
});

test('successful password reset signs out and returns to account login', () => {
  assert.match(reset, /await supabase\.auth\.signOut\(\)/);
  assert.match(reset, /router\.replace\('\/account'\)/);
});
