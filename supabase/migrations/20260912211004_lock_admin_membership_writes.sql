-- Admin membership is provisioning data, not a client-managed resource.
-- Keep self-SELECT for is_admin(), but deny every public write class.
revoke insert, update, delete, truncate, references, trigger
on table public.admin_users
from anon, authenticated;
