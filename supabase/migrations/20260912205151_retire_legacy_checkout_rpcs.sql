-- Keep V3 as the only customer-facing checkout entry point. The legacy
-- functions remain in place for schema compatibility, but are not callable
-- through the Data API by public client roles.
revoke all on function public.create_order_with_stock(text, uuid, uuid, uuid, integer)
from public, anon, authenticated;

revoke all on function public.create_customer_order_with_stock(text, uuid, jsonb, text)
from public, anon, authenticated;

revoke all on function public.create_customer_order_with_stock_v2(text, uuid, jsonb, text, text)
from public, anon, authenticated;
