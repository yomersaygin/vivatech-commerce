import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/app/admin/orders/[id]/page.tsx', import.meta.url), 'utf8');

test('admin order status changes use protected RPC', () => {
  assert.match(source, /supabase\.rpc\('admin_update_order_status'/);
  assert.match(source, /p_order_id:id/);
  assert.match(source, /p_new_status:status/);
});

test('admin status flow does not directly update protected status field', () => {
  assert.doesNotMatch(source, /\.update\(\{[^}]*status\s*:/s);
});

test('cancellation asks for explicit confirmation before RPC', () => {
  assert.match(source, /status==='cancelled'&&!confirm\(/);
});

test('terminal order states expose no further transitions', () => {
  assert.match(source, /delivered:\[\]/);
  assert.match(source, /cancelled:\[\]/);
});

test('shipping updates are restricted to shipping fields', () => {
  assert.match(source, /const payload=\{shipping_carrier:/);
  assert.match(source, /tracking_number:/);
  assert.match(source, /tracking_url:/);
  assert.match(source, /shipped_at:/);
  assert.doesNotMatch(source, /const payload=\{[^}]*total_amount:/s);
  assert.doesNotMatch(source, /const payload=\{[^}]*payment_status:/s);
});

test('tracking URLs only allow http or https schemes', () => {
  assert.match(source, /url\.protocol==='https:'\|\|url\.protocol==='http:'/);
});

test('historical delivery address is read from immutable snapshot', () => {
  assert.match(source, /shipping_address_snapshot/);
  assert.match(source, /const delivery=order\.shipping_address_snapshot\|\|\{\}/);
});
