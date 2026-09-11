import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/app/account/addresses/page.tsx', import.meta.url), 'utf8');

test('addresses are resolved from authenticated customer ownership', () => {
  assert.match(source, /supabase\.auth\.getUser\(\)/);
  assert.match(source, /\.from\('customers'\)[\s\S]*?\.eq\('auth_user_id',user\.user\.id\)/);
});

test('address and order reference reads are scoped to customer id', () => {
  const customerScopes = source.match(/\.eq\('customer_id',c\.id\)/g) || [];
  assert.ok(customerScopes.length >= 2);
});

test('address updates and deletes cannot target another customer', () => {
  assert.match(source, /\.update\(payload\)\.eq\('id',edit\.id\)\.eq\('customer_id',customerId\)/);
  assert.match(source, /\.delete\(\)\.eq\('id',id\)\.eq\('customer_id',customerId\)/);
});

test('new address ownership is assigned from current customer id', () => {
  assert.match(source, /const payload=\{customer_id:customerId,/);
});

test('addresses referenced by orders are protected from deletion in the UI', () => {
  assert.match(source, /usedAddressIds\.has\(id\)/);
  assert.match(source, /disabled=\{busy\|\|used\}/);
  assert.match(source, /Sipariş geçmişini korumak için bu adres silinemez/);
});
