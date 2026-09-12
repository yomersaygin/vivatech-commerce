revoke update on table public.orders from authenticated;

grant update (shipping_carrier, tracking_number, tracking_url, shipped_at)
on table public.orders
to authenticated;

create or replace function private.protect_order_shipped_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.shipped_at is distinct from new.shipped_at then
    if old.shipped_at is not null then
      raise exception 'Siparişin kargoya veriliş zamanı sonradan değiştirilemez';
    end if;

    if new.shipped_at is not null and new.status <> 'shipped' then
      raise exception 'Kargoya veriliş zamanı yalnız sipariş kargolandığında oluşturulabilir';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.protect_order_shipped_at() from public;
revoke all on function private.protect_order_shipped_at() from anon;
revoke all on function private.protect_order_shipped_at() from authenticated;

drop trigger if exists trg_protect_order_shipped_at on public.orders;

create trigger trg_protect_order_shipped_at
before update of shipped_at, status
on public.orders
for each row
execute function private.protect_order_shipped_at();
