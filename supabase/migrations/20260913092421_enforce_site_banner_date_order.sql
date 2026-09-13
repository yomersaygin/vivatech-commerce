alter table public.site_banners
  add constraint site_banners_date_check
  check (
    starts_at is null
    or ends_at is null
    or starts_at <= ends_at
  );
