alter table public.site_banners
  add constraint site_banners_title_nonblank_check
  check (title = btrim(title) and title <> '');

alter table public.content_blocks
  add constraint content_blocks_title_nonblank_check
  check (title = btrim(title) and title <> '');
