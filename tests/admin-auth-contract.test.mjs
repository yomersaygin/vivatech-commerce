import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const gateSource = await readFile(new URL('../src/app/admin/AdminGate.tsx', import.meta.url), 'utf8');
const loginSource = await readFile(new URL('../src/app/admin/login/page.tsx', import.meta.url), 'utf8');

test('admin gate requires an authenticated user before checking admin role', () => {
  assert.match(gateSource, /supabase\.auth\.getUser\(\)/);
  assert.match(gateSource, /if\(!user\).*router\.replace\('\/admin\/login'\)/s);
});

test('admin gate verifies authorization with is_admin RPC', () => {
  assert.match(gateSource, /supabase\.rpc\('is_admin'\)/);
  assert.match(gateSource, /if\(error \|\| data!==true\).*setState\('denied'\)/s);
});

test('denied admin users cannot render protected children', () => {
  assert.match(gateSource, /if\(state==='denied'\).*Erişim reddedildi/s);
  assert.match(gateSource, /return <>\{children\}<\/>/);
});

test('denied admin flow signs out before returning to login', () => {
  assert.match(gateSource, /supabase\.auth\.signOut\(\)/);
  assert.match(gateSource, /router\.replace\('\/admin\/login'\)/);
});

test('admin login uses password auth and redirects to admin only after success', () => {
  assert.match(loginSource, /supabase\.auth\.signInWithPassword\(\{email,password\}\)/);
  assert.match(loginSource, /if\(error\).*return.*router\.replace\('\/admin'\)/s);
});

test('first admin signup enforces a minimum password length', () => {
  assert.match(loginSource, /password\.length<8/);
  assert.match(loginSource, /supabase\.auth\.signUp\(\{email,password\}\)/);
});
