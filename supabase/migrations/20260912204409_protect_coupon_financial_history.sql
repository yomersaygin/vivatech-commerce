revoke insert, update, delete, truncate, references, trigger
on table public.coupon_redemptions
from anon, authenticated;

alter table public.orders
  drop constraint orders_coupon_id_fkey;

alter table public.orders
  add constraint orders_coupon_id_fkey
  foreign key (coupon_id)
  references public.coupons(id)
  on delete restrict;
