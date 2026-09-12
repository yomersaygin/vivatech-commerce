-- The customer profile mirrors the authenticated identity email. Email changes
-- must go through Supabase Auth rather than a direct public.customers update.
revoke update (email) on table public.customers from anon, authenticated;
