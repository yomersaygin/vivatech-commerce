create schema if not exists private;

create or replace function private.protect_terminal_order_shipping_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (old.status in ('cancelled', 'delivered') or new.status in ('cancelled', 'delivered')) and (
    old.shipping_carrier is distinct from new.shipping_carrier or
    old.tracking_number is distinct from new.tracking_number or
    old.tracking_url is distinct from new.tracking_url or
    old.shipped_at is distinct from new.shipped_at
  ) then
    raise exception 'Tamamlanmış veya iptal edilmiş siparişin kargo bilgileri değiştirilemez';
  end if;

  return new;
end;
$$;

revoke all on function private.protect_terminal_order_shipping_fields() from public;
revoke all on function private.protect_terminal_order_shipping_fields() from anon;
revoke all on function private.protect_terminal_order_shipping_fields() from authenticated;

drop trigger if exists trg_protect_terminal_order_shipping_fields on public.orders;

create trigger trg_protect_terminal_order_shipping_fields
before update of shipping_carrier, tracking_number, tracking_url, shipped_at, status
on public.orders
for each row
execute function private.protect_terminal_order_shipping_fields();
