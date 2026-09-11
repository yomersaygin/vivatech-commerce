import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const checkout = await readFile(new URL('../src/app/checkout/page.tsx', import.meta.url), 'utf8');

test('checkout uses only the V3 atomic order RPC', () => {
  assert.match(checkout, /create_customer_order_with_stock_v3/);
  assert.doesNotMatch(checkout, /create_customer_order_with_stock_v2/);
});

test('checkout sends product identity and quantity, not client-controlled prices', () => {
  assert.match(checkout, /items\.map\(x=>\(\{product_id:x\.id,quantity:x\.quantity\}\)\)/);
  assert.doesNotMatch(checkout, /unit_price\s*:/);
  assert.doesNotMatch(checkout, /line_total\s*:/);
  assert.doesNotMatch(checkout, /total_amount\s*:/);
});

test('checkout does not generate order numbers on the client', () => {
  assert.doesNotMatch(checkout, /Date\.now\(\)/);
  assert.doesNotMatch(checkout, /WEB-\$\{/);
  assert.match(checkout, /created\.order_number/);
});

test('checkout passes the selected shipping address and optional coupon to the server RPC', () => {
  assert.match(checkout, /p_shipping_address_id:addressId/);
  assert.match(checkout, /p_coupon_code:coupon\?\.code\|\|null/);
});

test('checkout requires an authenticated user, cart items and linked customer before submit', () => {
  assert.match(checkout, /if\(!user\|\|!items\.length\|\|!customerId\)return/);
});
