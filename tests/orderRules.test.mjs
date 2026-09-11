import test from 'node:test';
import assert from 'node:assert/strict';

const { canTransitionOrderStatus, nextStatuses, validTrackingUrl } = await import('../src/lib/orderRules.ts');

test('new orders allow confirmation, preparation, or cancellation', () => {
  assert.deepEqual(nextStatuses.new, ['confirmed', 'preparing', 'cancelled']);
});

test('shipping only allows delivery next', () => {
  assert.deepEqual(nextStatuses.shipped, ['delivered']);
});

test('delivered and cancelled orders are terminal', () => {
  assert.deepEqual(nextStatuses.delivered, []);
  assert.deepEqual(nextStatuses.cancelled, []);
  assert.equal(canTransitionOrderStatus('delivered', 'shipped'), false);
  assert.equal(canTransitionOrderStatus('cancelled', 'confirmed'), false);
});

test('same status is idempotently accepted', () => {
  assert.equal(canTransitionOrderStatus('new', 'new'), true);
  assert.equal(canTransitionOrderStatus('cancelled', 'cancelled'), true);
});

test('invalid status jumps are rejected', () => {
  assert.equal(canTransitionOrderStatus('new', 'delivered'), false);
  assert.equal(canTransitionOrderStatus('confirmed', 'delivered'), false);
  assert.equal(canTransitionOrderStatus('preparing', 'delivered'), false);
});

test('tracking URL accepts only http and https', () => {
  assert.equal(validTrackingUrl(''), true);
  assert.equal(validTrackingUrl('https://kargo.example/takip/123'), true);
  assert.equal(validTrackingUrl('http://kargo.example/123'), true);
  assert.equal(validTrackingUrl('javascript:alert(1)'), false);
  assert.equal(validTrackingUrl('ftp://example.com/file'), false);
  assert.equal(validTrackingUrl('not-a-url'), false);
});
