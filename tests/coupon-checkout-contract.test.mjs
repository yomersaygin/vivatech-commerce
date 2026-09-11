import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const cart = fs.readFileSync('src/components/CartProvider.tsx', 'utf8');
const couponBox = fs.readFileSync('src/components/CouponBox.tsx', 'utf8');
const checkout = fs.readFileSync('src/app/checkout/page.tsx', 'utf8');

test('coupon validation is delegated to the server RPC', () => {
  assert.match(cart, /supabase\.rpc\('validate_coupon'/);
  assert.match(cart, /p_code:clean/);
  assert.match(cart, /p_subtotal:subtotal/);
});

test('coupon codes are normalized before server validation', () => {
  assert.match(cart, /code\.trim\(\)\.toUpperCase\(\)/);
});

test('coupon UI uses cart provider validation instead of direct authoritative discount writes', () => {
  assert.match(couponBox, /applyCoupon\(code\)/);
  assert.doesNotMatch(couponBox, /from\('coupons'\)/);
  assert.doesNotMatch(couponBox, /discount_amount\s*:/);
});

test('checkout sends only the coupon code to the atomic order RPC', () => {
  assert.match(checkout, /p_coupon_code:coupon\?\.code\|\|null/);
  assert.doesNotMatch(checkout, /p_discount_amount\s*:/);
  assert.doesNotMatch(checkout, /discount_amount\s*:/);
});

test('checkout continues to use the protected v3 order RPC with coupon code', () => {
  assert.match(checkout, /create_customer_order_with_stock_v3/);
  assert.doesNotMatch(checkout, /create_customer_order_with_stock_v2/);
});

test('display total cannot go below zero', () => {
  assert.match(cart, /total:Math\.max\(0,subtotal-\(coupon\?\.discount\|\|0\)\)/);
});
