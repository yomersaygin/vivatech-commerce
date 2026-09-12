revoke insert, update, delete, truncate, references, trigger
on table public.order_items
from anon, authenticated;

revoke insert, update, delete, truncate, references, trigger
on table public.stock_movements
from anon, authenticated;
