## Per-user init patch, with wikireview as the shared fallback

### Concept
The sandbox itself has no production-usable per-user default (its localStorage default only works on localhost). We store each user's init patch in Lovable Cloud and inject it into the sandbox iframe via the existing `soundemote:sandbox-project-data` postMessage channel already wired in `SandboxPage.tsx`. No changes to the sandbox internals needed.

Resolution order when a user opens the plain `/sandbox`:
1. If the signed-in user has a saved init patch → load it.
2. Else → load **wikireview**'s init patch (the shared default).
3. Else → sandbox falls back to its own bundled `default.json`.

### Database (new migration)
Create `public.user_init_patches`:
- `owner_id uuid pk references auth.users on delete cascade`
- `project_data jsonb not null`
- `updated_at timestamptz default now()`
- Grants + RLS: public `select` (so anyone can read wikireview's fallback), owner-only `insert/update/delete`, `service_role all`.

### Frontend
1. **`SandboxPage.tsx`**: when route is plain `/sandbox` (no patch/share/wiki params), fetch the init patch:
   - resolve current session's `owner_id`; query `user_init_patches` for it.
   - if none, look up wikireview's profile id → query its init patch.
   - inject the resulting `project_data` via the existing `postProjectData` path.
2. **Save control**: add a small "set as my init patch" button (signed-in only) in the sandbox toolbar overlay. It calls the existing `requestCurrentPatch()` to grab the live patch, then upserts into `user_init_patches`.

### Notes / technical
- `requestCurrentPatch()` returns the `nodeGraphShareProjectData` shape (`{kind:"sandbox_patch", patch_data, ...}`), which is exactly what the inject path expects — so save and load are symmetric.
- wikireview's id is resolved by handle lookup in `profiles`, not hardcoded.
- Migration SQL will be provided to run in the Cloud SQL editor.