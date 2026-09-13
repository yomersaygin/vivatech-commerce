alter table public.campaigns
  add constraint campaigns_title_nonblank_check check (title = btrim(title) and title <> '');
alter table public.campaigns
  add constraint campaigns_slug_format_check check (slug = btrim(slug) and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
alter table public.coupons
  add constraint coupons_code_format_check check (
    code = btrim(code) and code <> '' and code = upper(code)
    and code ~ '^[A-Z0-9]+([_-][A-Z0-9]+)*$'
  );
