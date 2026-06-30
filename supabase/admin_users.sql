-- ============================================================
-- Admin user management: let admins read & manage all roles.
-- Run this in your Supabase SQL editor.
-- ============================================================

-- Admins can read every role row (in addition to "users read own roles").
drop policy if exists "admins read all roles" on public.user_roles;
create policy "admins read all roles"
  on public.user_roles for select
  to authenticated
  using (public.is_admin(auth.uid()));

-- Admins can grant roles.
drop policy if exists "admins insert roles" on public.user_roles;
create policy "admins insert roles"
  on public.user_roles for insert
  to authenticated
  with check (public.is_admin(auth.uid()));

-- Admins can revoke roles.
drop policy if exists "admins delete roles" on public.user_roles;
create policy "admins delete roles"
  on public.user_roles for delete
  to authenticated
  using (public.is_admin(auth.uid()));

grant delete on public.user_roles to authenticated;
