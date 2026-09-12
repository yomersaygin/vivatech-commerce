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

Repository persistence:
- The live function and trigger are mirrored by `supabase/migrations/20260912202457_persist_terminal_order_shipping_lock.sql`.
- The repo contract test verifies the protected statuses, all four immutable fields, trigger event and hardened function `search_path`.

### Shipping edge-case matrix
Additional rollback-only admin-context probes compared direct table updates with the protected status RPC.

Confirmed behavior:
- Shipping/tracking fields can currently be prepared during `new`, `confirmed` and `preparing` states.
- Shipping/tracking fields can be maintained while the order is `shipped`.
- A `cancelled` order rejected the same direct shipping update and retained its original values.
- The protected status RPC rejected `new -> delivered` as an invalid transition.

Gaps found by the probe before hardening:
- A direct admin table update accepted `new -> delivered`, bypassing the transition rule enforced by the RPC.
- A direct admin table update could populate `shipped_at` while an order was still `new`, `confirmed` or `preparing`.

Every edge-case manipulation ran inside a rollback-only probe. No order status, tracking value or timestamp from these probes was persisted.

### Direct-update and shipped-at hardening
The admin update privilege was narrowed from table-wide `orders` UPDATE to the four shipping columns used by the admin shipping form. Status and financial fields must now be changed through trusted database functions rather than direct Data API updates.

A separate trigger now enforces `shipped_at` lifecycle integrity:
- It cannot be populated while an order is `new`, `confirmed` or `preparing`.
- The controlled `preparing -> shipped` RPC transition can populate it.
- Once populated, it cannot be replaced or cleared.

Real rollback-only verification after hardening:
- Direct admin `new -> delivered` table UPDATE was rejected with `permission denied for table orders`.
- A coordinated direct change of `subtotal` and `total_amount` was rejected by the same column-privilege boundary.
- Direct early `shipped_at` creation was rejected by the database trigger.
- Pre-shipment carrier/tracking preparation without changing `shipped_at` remained allowed.
- The controlled RPC populated `shipped_at` on entry to `shipped`.
- Tracking data remained maintainable in `shipped` while the original `shipped_at` was preserved.
- After the probe, the source order remained `new` with `shipped_at = null`.

Repository persistence:
- `supabase/migrations/20260912203024_restrict_order_updates_and_shipped_at.sql` mirrors the privilege and trigger hardening.

## 2026-09-12 — Order-item and stock-movement history protection

Direct history manipulation was tested against the live database as the authenticated admin user. The test targeted one existing cancelled order item and its linked stock movement.

Rollback-only operations attempted:
- Update an order item's quantity and line total.
- Delete the existing order item.
- Insert an extra order item into the existing order.
- Update the linked stock movement quantity.
- Delete the linked stock movement.
- Insert an extra sale stock movement for the existing order.

Observed:
- The `authenticated` role has no INSERT, UPDATE or DELETE table privileges on either `order_items` or `stock_movements`.
- All six direct write attempts were rejected with `permission denied`.
- The order-item quantity remained `1`.
- The stock-movement quantity remained `1`.
- Admin membership did not bypass the table privilege boundary.

Trusted-RPC regression after the explicit revokes:
- V3 checkout still created one order item and one `sale` stock movement.
- Stock changed from `18` to `17` after order creation.
- Customer cancellation restored stock from `17` to `18`.
- Cancellation created exactly one `return_in` movement with `reference_type = order_cancel`.
- The rollback left `0` probe orders and restored the temporary admin-membership change.

Repository persistence:
- `supabase/migrations/20260912203627_lock_order_items_and_stock_movements.sql` explicitly revokes all direct write-class privileges from `anon` and `authenticated` for both history tables.
- Trusted SECURITY DEFINER order and cancellation functions retain owner-level access for legitimate atomic writes.

This was a real authenticated database transaction test, not a browser E2E test. No order item or stock movement was created, changed or deleted.

## 2026-09-12 — Coupon redemption and financial-history protection

A temporary 10% coupon and a real V3 order were created against the live database. The authenticated admin context then attempted to rewrite the resulting coupon history.

Direct-manipulation results before the additional grant hardening:
- Redemption UPDATE affected `0` rows under RLS.
- Redemption DELETE affected `0` rows under RLS.
- A forged redemption INSERT was rejected by RLS.
- Direct changes to the order's `coupon_id`, `discount_amount` and `total_amount` were rejected by the order column-privilege boundary.
- Deleting the used coupon was rejected by the redemption foreign key.
- Normal admin editing of the coupon catalogue row remained allowed, as intended.
- The original order discount remained `499.90` and its coupon link remained intact.

Hardening applied:
- Direct write-class privileges on `coupon_redemptions` were revoked from both `anon` and `authenticated`.
- `orders.coupon_id` now uses `ON DELETE RESTRICT` instead of `ON DELETE SET NULL`.

Trusted V3 regression after hardening:
- A 10% coupon produced exactly one redemption with discount `499.90`.
- Product stock changed from `18` to `17` during checkout.
- After deliberately removing the redemption inside the privileged rollback probe, deleting the coupon was still rejected by `orders_coupon_id_fkey`.
- The rollback left `0` probe orders and restored stock to `18`.

Repository persistence:
- `supabase/migrations/20260912204409_protect_coupon_financial_history.sql` contains the explicit privilege revokes and restrictive order-to-coupon foreign key.

All coupon probes were rollback-only real database transaction tests. They are not browser E2E evidence.

## 2026-09-12 — Legacy checkout entry-point retirement

The live function privilege surface showed that the current application checkout correctly used only `create_customer_order_with_stock_v3`, but two older checkout functions were still executable by `authenticated` and the oldest function was also executable by `anon`.

Hardening applied:
- Revoked all execution privileges from `public`, `anon` and `authenticated` on `create_order_with_stock(text,uuid,uuid,uuid,integer)`.
- Revoked the same privileges on `create_customer_order_with_stock(text,uuid,jsonb,text)`.
- Reasserted the existing closed state for `create_customer_order_with_stock_v2(text,uuid,jsonb,text,text)`.
- Kept `create_customer_order_with_stock_v3(uuid,jsonb,text,text)` executable by `authenticated` as the sole customer checkout entry point.

Real rollback-only authenticated V3 regression after hardening:
- V3 returned a real order identifier and created the order with `payment_status = pending`.
- Exactly one order item and one `sale` stock movement were created.
- Product stock decreased by exactly one unit.
- The transaction rollback restored the temporary admin-membership change and left `0` probe orders.

Post-hardening privilege verification:
- All three legacy functions report `anon/authenticated EXECUTE = false` for their former client roles.
- V3 reports `authenticated EXECUTE = true`.

Repository persistence:
- `supabase/migrations/20260912205151_retire_legacy_checkout_rpcs.sql` records the explicit legacy RPC revokes.
- The source contract verifies that the application calls only V3.

This is a real database privilege check and rollback-only RPC transaction test. It is not a browser E2E test.

## 2026-09-12 — Customer identity and address ownership

Customer/profile and address ownership were verified directly against the live database as the owning authenticated customer. Admin membership was temporarily removed inside the transaction so the probe exercised the normal customer path.

Pre-hardening finding:
- The profile UI treated email as read-only, but `authenticated` still had direct UPDATE privilege on `customers.email`.
- A real direct update changed the customer-table email inside the probe transaction, demonstrating that the Auth identity email and customer record could diverge.
- The rollback left the real customer email unchanged, and the live drift count remained `0`.

Hardening applied:
- Revoked direct UPDATE on `customers.email` from `anon` and `authenticated`.
- Email identity changes must now use the Supabase Auth lifecycle instead of rewriting the customer profile mirror.

Real post-hardening verification:
- Direct changes to `customers.email` and `customers.auth_user_id` were rejected.
- Direct reassignment of `addresses.customer_id` was rejected.
- A referenced shipping address could not be deleted.
- Normal customer edits to `customers.first_name` and `addresses.title` still succeeded inside the transaction.
- RLS retained both ownership `USING` and `WITH CHECK` predicates for customer and address updates.
- The rollback restored temporary admin membership and left `0` profile/address probe values.

Repository persistence:
- `supabase/migrations/20260912210409_protect_customer_email_identity.sql` records the email-column privilege boundary.
- The source contract verifies that the profile UI keeps email read-only and excludes email/ownership fields from its update payload.

This was a rollback-only authenticated database test. It was not a browser E2E test.

## 2026-09-12 — Admin membership privilege boundary

The live `admin_users` table had RLS enabled and only a self-SELECT policy. No client INSERT, UPDATE or DELETE policy existed, so direct privilege escalation was already rejected by RLS. However, `anon` and `authenticated` still held unnecessary table-level write-class grants.

Defense-in-depth hardening:
- Revoked INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES and TRIGGER from `anon` and `authenticated` on `admin_users`.
- Retained authenticated SELECT so `is_admin()` and the admin gate continue to work.
- The first-admin bootstrap trigger remains non-callable by `anon` and `authenticated` and only runs from the Auth user creation trigger path when no admin exists.

Real rollback-only verification:
- The existing admin identity returned `is_admin() = true` before the probe membership was temporarily removed.
- With membership removed inside the transaction, the same authenticated identity returned `is_admin() = false`.
- Direct INSERT, UPDATE, DELETE and TRUNCATE attempts were all rejected by the table privilege boundary.
- Authenticated self-SELECT and execution of `is_admin()` remained available.
- Rollback restored the admin membership; the live admin count remained `1`.

Repository persistence:
- `supabase/migrations/20260912211004_lock_admin_membership_writes.sql` records the explicit write-class revokes.
- The repository contract protects both the write denial and the retained read path.

This was a rollback-only authenticated database test. It was not a browser E2E test.

## 2026-09-12 — Single-use first-admin bootstrap

The live authorization surface confirmed that `anon` and `authenticated` have no INSERT, UPDATE or DELETE privilege on `admin_users`. A lifecycle gap nevertheless remained in the original signup trigger: it promoted a signup whenever `admin_users` was empty. Because the sole admin row cascades when its Auth user is deleted, a later arbitrary signup could have become admin.

Hardening applied:
- Added `private.admin_bootstrap_state`, a one-row persistent single-use latch outside the exposed API schema.
- Initialized the latch as consumed because the live project already has one valid admin.
- Replaced the bootstrap trigger function so it atomically claims the latch only when `consumed = false`.
- The consumed state survives deletion of an admin Auth user and cannot reopen automatically.
- Enabled RLS, added an explicit restrictive deny policy and revoked all client-role access to the private latch.
- Reasserted that the trigger function is not executable by `public`, `anon` or `authenticated`.

Real rollback-only authenticated database verification:
- A normal-user context could not INSERT, UPDATE or DELETE `admin_users` rows.
- The private latch was inaccessible to `authenticated`.
- In a privileged rollback probe, the first atomic latch claim affected exactly `1` row and the second affected `0` rows.
- After rollback, the project retained `1` admin, `bootstrap_consumed = true` and the signup trigger remained installed.

Repository persistence:
- `supabase/migrations/20260912211520_make_admin_bootstrap_single_use.sql` contains the private latch and hardened trigger function.
- The source contract rejects the former repeatable `if not exists(admin_users)` decision rule.

This was a database authorization and concurrency-contract test. It was not a browser E2E test.

Important: these are real database/RPC transaction tests, not authenticated browser E2E tests. PostgreSQL sequences are non-transactional, so test-generated order-number sequence values may be skipped even though order rows are rolled back; that is expected behavior.
