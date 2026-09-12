alter table public.products
  drop constraint products_category_id_fkey,
  add constraint products_category_id_fkey
    foreign key (category_id)
    references public.categories(id)
    on delete restrict;

alter table public.products
  drop constraint products_brand_id_fkey,
  add constraint products_brand_id_fkey
    foreign key (brand_id)
    references public.brands(id)
    on delete restrict;

alter table public.categories
  drop constraint categories_parent_id_fkey,
  add constraint categories_parent_id_fkey
    foreign key (parent_id)
    references public.categories(id)
    on delete restrict;
