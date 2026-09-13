alter table public.site_banners
  add constraint site_banners_safe_link_url_check
  check (
    link_url is null
    or (
      link_url = pg_catalog.btrim(link_url)
      and (
        link_url ~* '^https?://[^[:space:]]+$'
        or (
          pg_catalog.left(link_url, 1) = '/'
          and pg_catalog.left(link_url, 2) <> '//'
          and link_url !~ '[[:space:]]'
        )
        or (
          pg_catalog.left(link_url, 1) = '#'
          and link_url !~ '[[:space:]]'
        )
      )
    )
  );

alter table public.content_blocks
  add constraint content_blocks_safe_link_url_check
  check (
    link_url is null
    or (
      link_url = pg_catalog.btrim(link_url)
      and (
        link_url ~* '^https?://[^[:space:]]+$'
        or (
          pg_catalog.left(link_url, 1) = '/'
          and pg_catalog.left(link_url, 2) <> '//'
          and link_url !~ '[[:space:]]'
        )
        or (
          pg_catalog.left(link_url, 1) = '#'
          and link_url !~ '[[:space:]]'
        )
      )
    )
  );
