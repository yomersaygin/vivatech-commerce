create or replace function private.prevent_category_hierarchy_cycle()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Serialize hierarchy changes so two concurrent reparents cannot create a cycle
  -- after independently observing an acyclic snapshot.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('public.categories.hierarchy')
  );

  if new.parent_id is null then
    return new;
  end if;

  if new.parent_id = new.id then
    raise exception 'A category cannot be its own parent';
  end if;

  if exists (
    with recursive ancestors as (
      select c.id, c.parent_id, array[c.id]::uuid[] as visited
      from public.categories c
      where c.id = new.parent_id

      union all

      select c.id, c.parent_id, a.visited || c.id
      from public.categories c
      join ancestors a on c.id = a.parent_id
      where not c.id = any(a.visited)
    )
    select 1
    from ancestors
    where id = new.id
  ) then
    raise exception 'Category hierarchy cannot contain a cycle';
  end if;

  return new;
end;
$$;

revoke all on function private.prevent_category_hierarchy_cycle() from public, anon, authenticated;

drop trigger if exists categories_prevent_hierarchy_cycle on public.categories;
create trigger categories_prevent_hierarchy_cycle
before insert or update of parent_id on public.categories
for each row
execute function private.prevent_category_hierarchy_cycle();
