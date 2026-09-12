-- Persist whether the one-time first-admin bootstrap has ever been consumed.
-- This state does not cascade when an Auth user is deleted.
create table if not exists private.admin_bootstrap_state (
  singleton boolean primary key default true check (singleton),
  consumed boolean not null,
  consumed_at timestamptz
);

alter table private.admin_bootstrap_state enable row level security;
revoke all on table private.admin_bootstrap_state from public, anon, authenticated;

create policy admin_bootstrap_state_no_client_access
on private.admin_bootstrap_state
as restrictive
for all
to public
using (false)
with check (false);

insert into private.admin_bootstrap_state(singleton, consumed, consumed_at)
values (
  true,
  exists(select 1 from public.admin_users),
  case when exists(select 1 from public.admin_users) then now() else null end
)
on conflict (singleton) do update
set consumed = private.admin_bootstrap_state.consumed or excluded.consumed,
    consumed_at = coalesce(private.admin_bootstrap_state.consumed_at, excluded.consumed_at);

create or replace function public.bootstrap_first_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_claimed boolean := false;
begin
  update private.admin_bootstrap_state
  set consumed = true, consumed_at = now()
  where singleton = true and consumed = false
  returning true into v_claimed;

  if coalesce(v_claimed, false) then
    insert into public.admin_users(user_id) values (new.id);
  end if;

  return new;
end;
$function$;

revoke all on function public.bootstrap_first_admin() from public, anon, authenticated;
