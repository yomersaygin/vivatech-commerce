# Vivatech Commerce — DB Transaction Verification

## 2026-09-11 — Current V3 checkout RPC

The current `public.create_customer_order_with_stock_v3(uuid,jsonb,text,text)` path was verified directly against the live Supabase database inside a rollback-only transaction.

Test context:
- Auth context: `authenticated`
- Admin membership was temporarily removed inside the transaction so the call ran as a normal customer (`is_admin() = false`).
- The real linked customer/address and the current test product were used.
- No persistent business data was left behind; the transaction was rolled back.

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

Rollback verification after the test:
- Product stock returned to `18`.
- Probe order rows: `0`.
- Probe stock movement rows: `0`.
- Temporarily removed admin membership was restored by rollback.

Important: this is a real database/RPC transaction test, not an authenticated browser E2E test. PostgreSQL sequences are non-transactional, so test-generated order-number sequence values may be skipped even though the order rows were rolled back; that is expected behavior.
