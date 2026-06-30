# Claim-a-URL with Admin Review

Turn every `soundemote.io/:slug` into claimable space. Unclaimed slugs open a generic patch with a "claim this url" affordance; anonymous visitors submit their current sandbox patch + contact; you (admin) review and approve; approved claims become frozen snapshots served at that URL.

## Decisions locked in
- **Claim = anonymous** + contact field (no signup to claim)
- **Admin = your email**, auto-granted the admin role on login
- **Bound patch = the visitor's current sandbox patch** (serialized from the iframe at submit time)
- **Approved = frozen snapshot** (owner must re-submit to change)

## How a URL resolves (reuses existing routing)
```text
/sinewave
  -> PatchShortlinkPage / SandboxPage lookup in shared_projects (slug = sinewave)
       claimed?  -> load that frozen snapshot, normal chrome
       unclaimed -> load generic default patch + "unclaimed · claim this url" banner
```
Approval writes the snapshot into `shared_projects` keyed by the slug, so the existing resolver serves it with zero new read path.

## User-facing pieces
1. **Unclaimed-space UX** (`SandboxPage`): when no patch matches the slug, still render the sandbox with the default patch, plus a distinct banner/badge — e.g. `⌁ sinewave · unclaimed — claim this url` with a subtly different accent so it reads as a vacant lot. Button opens the claim form.
2. **Claim form** (dialog): contact field (email, validated) + optional note. On submit it asks the iframe for the current serialized patch (postMessage round-trip), then inserts a row into `patch_claims` with status `pending`. Shows a "submitted for review" confirmation.
3. **Admin login** (`/admin/login`): email/password (+ Google) via the existing Supabase auth. Only you matter here.
4. **Admin review queue** (`/admin/claims`, guarded by admin role): list pending claims, preview each patch in the sandbox, Approve / Reject. Approve promotes the snapshot into `shared_projects` at the requested slug and marks the claim `approved`. Reject marks `rejected` with an optional reason.

## Data model (SQL you run on your Supabase project)
- `patch_claims`: `id`, `requested_slug`, `contact_email`, `note`, `project_data jsonb`, `status` (pending/approved/rejected), `created_at`, `reviewed_at`, `review_note`.
  - RLS: `anon` may INSERT (status forced to pending); `admin` may SELECT/UPDATE; no public SELECT.
- `app_role` enum + `user_roles` + `has_role()` security-definer fn (standard pattern).
- Trigger on `auth.users`: when email = your address and is verified, grant `admin`.
- `shared_projects`: approval inserts/updates a row (slug, project_data snapshot, owner/bank/patch route columns). Already has the route columns.
- Fix the missing `GRANT SELECT ON public.patch_shortlinks TO anon` (or retire that table in favor of `shared_projects` — recommend retiring it for now to keep one source of truth).

## Required iframe change (sandbox)
The current `ShareProjectDialog` only stores metadata, NOT the real patch. To capture the visitor's actual current patch, the sandbox iframe needs to answer a `postMessage` request with its serialized patch (`nodeGraphSharePayload`). Add a small handler in `node-graph-bootstrap.js`:
- on receiving `soundemote:request-current-patch`, reply with `soundemote:current-patch` carrying `project_data`.
The parent claim form posts the request and waits for the reply before inserting. This is the one genuinely new integration; everything else is wiring.

## Build order
1. SQL: `patch_claims`, roles + `has_role`, admin-email grant trigger, grants. (You apply on your Supabase dashboard — external project, not Lovable-managed.)
2. Sandbox iframe: add the `request-current-patch` / `current-patch` message handler.
3. Auth: `/admin/login` page + auth state listener + admin guard hook.
4. Admin queue: `/admin/claims` page (list, preview, approve→promote, reject).
5. Public: unclaimed-space banner in `SandboxPage` + claim dialog (contact + submit).
6. Validation (zod) on the claim form; cleanup/retire `patch_shortlinks` path.

## Notes / open risks
- **Auth lives on your existing external Supabase project**, so the schema + trigger are SQL you run there (I'll provide the files, like `supabase/sandbox_patch_routes.sql`). If you'd rather I manage migrations directly, we'd switch to Lovable Cloud — separate decision.
- **Squatting / spam**: anonymous inserts can be spammed. v1 mitigations: zod validation, slug normalization, a reserved-words block, and admin review as the gate (nothing goes live without you). Rate limiting is v2.
- **Slug collisions**: if a slug is already claimed, the form should say "already taken" instead of accepting a duplicate claim.
