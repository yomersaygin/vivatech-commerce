create unique index product_images_one_primary_per_product_uidx
on public.product_images (product_id)
where is_primary = true;
