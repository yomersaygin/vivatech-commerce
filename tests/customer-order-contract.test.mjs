import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/app/account/orders/[id]/page.tsx', import.meta.url), 'utf8');

test('customer order detail resolves current auth user and linked customer', () => {
  assert.match(source, /supabase\.auth\.getUser\(\)/);
  assert.match(source, /\.from\('customers'\).*?\.eq\('auth_user_id',user\.user\.id\)/s);
});

test('customer order detail query is scoped to both order id and customer id', () => {
  assert.match(source, /\.from\('orders'\).*?\.eq\('id',id\)\.eq\('customer_id',customer\.id\)/s);
});

test('customer cancellation uses the dedicated server RPC', () => {
  assert.match(source, /supabase\.rpc\('cancel_customer_order',\{p_order_id:order\.id\}\)/);
});

test('customer can only request cancellation before shipment', () => {
  assert.match(source, /\['new','confirmed','preparing'\]\.includes\(order\.status\)/);
  assert.doesNotMatch(source, /\['new','confirmed','preparing','shipped'/);
});

test('paid orders do not expose direct customer cancellation', () => {
  assert.match(source, /order\.payment_status!=='paid'/);
  assert.match(source, /Ödemesi tamamlanmış siparişler doğrudan iptal edilemez/);
});

test('shipping history is rendered from immutable snapshot', () => {
  assert.match(source, /shipping_address_snapshot/);
  assert.doesNotMatch(source, /addresses\(/);
});
