alter table public.products
  add constraint products_name_nonblank_check
  check (name = btrim(name) and name <> '');

alter table public.products
  add constraint products_slug_format_check
  check (
    slug = btrim(slug)
    and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  );
