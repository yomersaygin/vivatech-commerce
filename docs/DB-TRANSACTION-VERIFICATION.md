# Vivatech Commerce — DB Transaction Verification

## 2026-09-11 — Current V3 checkout RPC

The current `public.create_customer_order_with_stock_v3(uuid,jsonb,text,text)` path was verified directly against the live Supabase database inside rollback-only transactions.

Test context:
- Auth context: `authenticated`
- Admin membership was temporarily removed inside each transaction so the call ran as a normal customer (`is_admin() = false`).
- The real linked customer/address and the current test product were used.
- No persistent business data was left behind; every verification transaction was rolled back.

### Successful order path
Observed inside the transaction:
- V3 RPC returned an order id and a database-generated order number.
- Product stock changed from `18` to `17` for quantity `1`.
- Order customer matched the authenticated customer's linked customer row.
- Subtotal: `4999.00`.
- Total: `4999.00`.
- Order item quantity: `1`.
- Unit price: `4999.00`.
- Line total: `4999.00`.
- Exactly one `sale` stock movement was created for the test order.
- `shipping_address_snapshot` was populated.

Rollback verification after the successful-path test:
- Product stock returned to `18`.
- Probe order rows: `0`.
- Probe stock movement rows: `0`.
- Temporarily removed admin membership was restored by rollback.

### Negative-path atomicity
The same current V3 RPC was then tested as a normal authenticated customer for two failure cases:
- Insufficient stock: requested quantity `9999` while current stock was `18`; the RPC rejected the order.
- Foreign shipping address: an address belonging to a different customer was supplied; the RPC rejected the order.

Observed after both rejected calls, still inside the transaction:
- Both negative cases were blocked.
- Product stock remained `18`.
- No probe order was persisted.
- No partial stock side effect was observed.
- The temporary removal of admin membership remained isolated to the test transaction.

Rollback verification after the negative-path test:
- Product stock was still `18`.
- Admin membership row was restored (`1` row).
- Probe order rows remained `0`.

### Duplicate same-product rows
The current V3 checkout RPC was verified with the same product appearing in two separate cart rows.

Within-stock case:
- Two rows were submitted for the same product with quantities `2` and `3`.
- Total ordered quantity was `5`.
- Two order-item rows were created, preserving the submitted rows.
- Subtotal and total were both `24995.00`.
- Total `sale` stock-movement quantity was `5`.
- `shipping_address_snapshot` was populated.

Over-stock case:
- Current stock was `18`.
- Two rows were submitted with a combined quantity of `19`.
- The RPC rejected the order with an insufficient-stock error.
- Product stock remained `18`.
- No probe order was created.

All duplicate-row verification was rollback-only; no persistent order, order item, or stock movement was left behind.

### Coupon enforcement and usage limits
A temporary percentage coupon was created inside a rollback-only transaction and used through the current V3 checkout RPC as a normal authenticated customer.

Observed on the first checkout:
- Product subtotal: `4999.00`.
- Coupon discount: `499.90` (`10%`).
- Final total: `4499.10`.
- Exactly one coupon-redemption row was created.
- Product stock changed from `18` to `17`.

The same customer then attempted to use the same coupon again while `per_customer_limit = 1`:
- The second checkout was rejected with `Bu kuponu kullanım limitinize ulaştınız`.
- Product stock remained `17`; there was no second stock decrement.
- No second successful order or coupon redemption was created.

Rollback verification:
- Product stock returned to `18`.
- Temporary test orders: `0`.
- Temporary coupon rows: `0`.
- Admin membership row was restored.

### Customer cancellation stock restoration and idempotence
A real V3 order was created inside a rollback-only transaction and then cancelled through `public.cancel_customer_order(uuid)` as the owning normal authenticated customer.

Observed:
- After order creation, product stock changed from `18` to `17` and order status was `new`.
- First cancellation changed order status to `cancelled`.
- Stock was restored from `17` to `18`.
- Exactly one `return_in` stock movement was created with quantity `1`.

The same order was then cancelled a second time:
- Order status remained `cancelled`.
- Product stock remained `18`.
- `return_in` movement count remained `1`.
- Returned quantity remained `1`.

This confirms cancellation is idempotent for stock restoration and does not double-return inventory.

Rollback verification:
- Product stock was `18`.
- Test order rows: `0`.
- Test stock-movement rows: `0`.
- Admin membership row was restored.

## 2026-09-12 — Payment lifecycle and cancellation safety

Payment-state handling was verified against the live database in rollback-only transactions using the owning authenticated customer.

### Paid order protection
Before hardening, a `paid` order could be cancelled by the customer, which could produce an inconsistent state: `status = cancelled` while `payment_status = paid` and stock was restored before any payment refund was recorded.

The customer cancellation RPC was hardened so a paid order cannot be directly cancelled. The required lifecycle is now: refund/payment reversal first, then cancellation.

Real DB verification after the hardening:
- A V3 order was created and its payment state was set to `paid` inside the test transaction.
- Customer cancellation was rejected with `Ödemesi tamamlanmış sipariş doğrudan iptal edilemez; önce iade işlemi tamamlanmalıdır`.
- Order status remained `new`.
- Payment status remained `paid`.
- Stock remained `17`; no incorrect inventory return occurred.

### Failed payment cancellation
A V3 order with `payment_status = failed` was cancelled through the customer cancellation RPC.

Observed:
- Order status became `cancelled`.
- Payment status remained `failed`.
- Stock was restored from `17` to `18`.
- Exactly one `return_in` stock movement was created.

### Refunded payment cancellation and idempotence
A V3 order with `payment_status = refunded` was cancelled through the same customer RPC.

Observed:
- Order status became `cancelled`.
- Payment status remained `refunded`.
- Stock was restored to `18`.
- A repeated cancellation did not restore stock a second time.
- `return_in` movement count remained `1`, with returned quantity `1`.

Rollback verification after these payment-lifecycle tests:
- Product stock was `18`.
- Probe/test orders were `0`.
- Temporary admin membership changes were fully restored.

The verified lifecycle is therefore:
- `pending`: normal pre-payment order state.
- `paid`: customer direct cancellation is blocked until refund/payment reversal is completed.
- `failed`: cancellation is allowed and stock returns exactly once.
- `refunded`: cancellation is allowed and stock returns exactly once; repeated cancellation is idempotent.

## 2026-09-12 — Shipping lifecycle and terminal-order protection

The order shipping lifecycle was verified directly against the live database in rollback-only transactions.

### Shipping lifecycle
A V3 order was created and advanced through the controlled admin status RPC.

Observed:
- `new -> preparing -> shipped` succeeded.
- Entering `shipped` populated `shipped_at` automatically.
- Shipping carrier, tracking number and HTTP(S) tracking URL were persisted correctly.
- `shipped -> delivered` succeeded.
- The original `shipped_at` value remained unchanged after delivery.
- Rollback left no persistent probe order and restored the product stock to `18`.

### Terminal shipping-field protection
A gap was found during direct database verification: shipping fields could still be changed on a terminal order by an authenticated admin through a direct table update even though the UI disabled the save button.

Database protection was added so terminal orders cannot have their shipping history rewritten after completion. The protected terminal states are `cancelled` and `delivered`.

Verified after hardening:
- Updating `shipping_carrier`, `tracking_number`, `tracking_url` or `shipped_at` on a `cancelled` order is blocked by the database trigger.
- The same protection applies to `delivered` orders.
- A normal customer direct update of shipping fields affected `0` rows under RLS.
- After a blocked terminal-order manipulation attempt, the cancelled order's shipping fields remained unchanged.

The resulting rule is:
- Before terminal state: authorized admin shipping data can be maintained.
- `cancelled` or `delivered`: shipping history is immutable at the database layer, not only in the UI.

Important: these are real database/RPC transaction tests, not authenticated browser E2E tests. PostgreSQL sequences are non-transactional, so test-generated order-number sequence values may be skipped even though order rows are rolled back; that is expected behavior.
