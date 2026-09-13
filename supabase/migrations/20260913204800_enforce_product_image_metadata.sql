alter table public.product_images
  add constraint product_images_url_nonblank_check
  check (image_url = btrim(image_url) and image_url <> '');

alter table public.product_images
  add constraint product_images_sort_order_nonnegative_check
  check (sort_order >= 0);
