import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const checkout = await readFile(new URL('../src/app/checkout/page.tsx', import.meta.url), 'utf8');

test('checkout creates orders only through the atomic V3 RPC', () => {
  assert.match(checkout, /create_customer_order_with_stock_v3/);
  assert.doesNotMatch(checkout, /from\(['"]orders['"]\)\.insert/);
});

test('checkout does not trust the client to set payment state or paid totals', () => {
  assert.doesNotMatch(checkout, /payment_status\s*:/);
  assert.doesNotMatch(checkout, /paid_at\s*:/);
  assert.doesNotMatch(checkout, /payment_method\s*:/);
  assert.doesNotMatch(checkout, /total_amount\s*:/);
});

test('checkout clearly treats payment as pending until a real payment integration exists', () => {
  assert.match(checkout, /Ödeme entegrasyonu henüz aktif değildir/);
  assert.match(checkout, /ödeme durumu beklemede oluşturulur/);
});

test('order success is based on the server-returned order number, not a client payment claim', () => {
  assert.match(checkout, /created\.order_number/);
  assert.doesNotMatch(checkout, /paymentSuccess|payment_success|isPaid|paid\s*=\s*true/);
});
