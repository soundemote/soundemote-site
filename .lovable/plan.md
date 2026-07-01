# Plan: User Files + Privacy Layer

You already have the file explorer UI. This plan only adds the privacy layer, link spots, and a hook so the explorer can plug into it later.

## What we'll build

1. **Database schema** — `public.user_files` metadata table
   - `id`, `owner_id` (FK to auth.users), `slug`, `name`, `description`
   - `is_public` boolean, `storage_path` text, `size` int, `mime_type` text
   - `created_at`, `updated_at` timestamps
   - Grants for `anon`, `authenticated`, `service_role`
   - RLS policies:
     - Public read: `anon` + `authenticated` can see rows where `is_public = true`
     - Owner read/write: authenticated users can see and manage their own files
     - Admin manage: users with `admin` role can manage all files

2. **Storage bucket** (if the explorer uses Supabase Storage)
   - `user-files` bucket
   - RLS: owner can upload/update/delete; public read for public files; admin full access

3. **Hook update** — extend `src/hooks/useUserFiles.ts`
   - `myFiles` — list all files for the signed-in user
   - `publicFiles(handle)` — list public files for any user
   - `isOwner(file)` helper
   - Keep the existing `myFilesUrl` / `userFilesUrl` helpers

4. **UI link spots** (dummy space only, no explorer)
   - Nav: keep the `files` link for signed-in users
   - User profile page (`UserPage.tsx`): add a "Files" section under Banks that lists public files for the viewed user as simple text links (placeholder styling until the explorer replaces it)

## Out of scope

- The actual file explorer UI / upload UI / folder tree
- File preview, download, drag-and-drop
- Those will be handled by the agent working on the explorer

## Files to create/edit

- `supabase/user_files.sql` — new migration
- `src/hooks/useUserFiles.ts` — extend
- `src/pages/UserPage.tsx` — add Files section
- `src/components/soundemote/Nav.tsx` — already has link spot

## Next step

Approve this plan and I'll implement the schema, hook, and dummy link spots.