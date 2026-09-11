import test from 'node:test';
import assert from 'node:assert/strict';

const { cartCount, cartSubtotal, clampQuantity } = await import('../src/lib/cart.ts');

test('clampQuantity returns zero when stock is zero', () => {
  assert.equal(clampQuantity(3, 0), 0);
});

test('clampQuantity never exceeds stock', () => {
  assert.equal(clampQuantity(8, 5), 5);
});

test('clampQuantity normalizes invalid and fractional quantities', () => {
  assert.equal(clampQuantity(0, 5), 1);
  assert.equal(clampQuantity(-4, 5), 1);
  assert.equal(clampQuantity(2.9, 5), 2);
});

test('cartSubtotal calculates line totals', () => {
  const items = [
    { id: 'a', name: 'A', slug: 'a', price: 100, quantity: 2, stock_quantity: 5 },
    { id: 'b', name: 'B', slug: 'b', price: 49.9, quantity: 3, stock_quantity: 8 },
  ];
  assert.equal(cartSubtotal(items), 349.7);
});

test('cartCount sums item quantities', () => {
  const items = [
    { id: 'a', name: 'A', slug: 'a', price: 100, quantity: 2, stock_quantity: 5 },
    { id: 'b', name: 'B', slug: 'b', price: 50, quantity: 3, stock_quantity: 8 },
  ];
  assert.equal(cartCount(items), 5);
});
