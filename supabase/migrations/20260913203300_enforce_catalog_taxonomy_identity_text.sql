alter table public.categories
  add constraint categories_name_nonblank_check
  check (name = btrim(name) and name <> '');

alter table public.categories
  add constraint categories_slug_format_check
  check (slug = btrim(slug) and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

alter table public.brands
  add constraint brands_name_nonblank_check
  check (name = btrim(name) and name <> '');

alter table public.brands
  add constraint brands_slug_format_check
  check (slug = btrim(slug) and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
