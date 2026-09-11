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

Important: these are real database/RPC transaction tests, not authenticated browser E2E tests. PostgreSQL sequences are non-transactional, so test-generated order-number sequence values may be skipped even though order rows are rolled back; that is expected behavior.
