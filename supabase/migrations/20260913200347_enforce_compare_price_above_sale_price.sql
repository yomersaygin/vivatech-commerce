alter table public.products
  drop constraint products_compare_at_price_check;

alter table public.products
  add constraint products_compare_at_price_check
  check (
    compare_at_price is null
    or compare_at_price > price
  );
