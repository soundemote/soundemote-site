-- ============================================================
-- Sign in by @handle
-- Maps a public @handle to the account email so users can log
-- in with their handle instead of their email address.
-- Run this on your Supabase project (SQL editor).
-- ============================================================

create or replace function public.email_for_handle(p_handle text)
returns text
language sql
stable
security definer
set search_path = public, auth
as $$
  select u.email
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.handle = lower(p_handle)
  limit 1
$$;

-- Allow the sign-in form (unauthenticated visitors) to resolve a handle.
grant execute on function public.email_for_handle(text) to anon, authenticated;
