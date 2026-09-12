create or replace function private.record_initial_product_stock()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if new.stock_quantity > 0 then
    insert into public.stock_movements(
      product_id, movement_type, quantity, reference_type, reference_id, note
    ) values (
      new.id, 'opening', new.stock_quantity, 'product', new.id, 'Ürün açılış stoğu'
    );
  end if;
  return new;
end;
$function$;

drop trigger if exists trg_record_initial_product_stock on public.products;
create trigger trg_record_initial_product_stock
after insert on public.products
for each row execute function private.record_initial_product_stock();

create or replace function public.admin_adjust_product_stock(
  p_product_id uuid,
  p_new_quantity integer,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_old_quantity integer;
  v_delta integer;
begin
  if not public.is_admin() then raise exception 'Yetkisiz işlem'; end if;
  if p_new_quantity is null or p_new_quantity < 0 then
    raise exception 'Stok miktarı sıfır veya daha büyük olmalıdır';
  end if;

  select stock_quantity into v_old_quantity
  from public.products where id = p_product_id for update;
  if not found then raise exception 'Ürün bulunamadı'; end if;

  v_delta := p_new_quantity - v_old_quantity;
  if v_delta = 0 then return; end if;

  update public.products set stock_quantity = p_new_quantity where id = p_product_id;
  insert into public.stock_movements(
    product_id, movement_type, quantity, reference_type, reference_id, note
  ) values (
    p_product_id,
    case when v_delta > 0 then 'adjustment_in' else 'adjustment_out' end,
    abs(v_delta), 'admin_adjustment', p_product_id,
    coalesce(nullif(trim(p_note),''),'Admin stok ayarı')
  );
end;
$function$;

revoke all on function public.admin_adjust_product_stock(uuid, integer, text)
from public, anon, authenticated;
grant execute on function public.admin_adjust_product_stock(uuid, integer, text)
to authenticated;

revoke update on table public.products from anon, authenticated;
grant update (
  name, slug, sku, barcode, description, price, compare_at_price,
  category_id, brand_id, seo_title, seo_description, is_active
) on table public.products to authenticated;
