# Static page patches

Each `*.json` file here is a public URL on soundemote.io:

| File | URL |
|------|-----|
| `init.json` | `/`, `/init`, `/sandbox` |
| `reverb.json` | `/reverb` (also used by live embeds) |
| `{name}.json` | `/{name}` |

## Publish a patch (no login)

1. Open the sandbox on the site and build the graph.
2. Click **Share Patch** in the sandbox chrome — it downloads `{name}.json`
   (named from the current URL when embedded, e.g. `/init` → `init.json`).
3. Move/replace the file in this folder.
4. Commit and deploy the site.

Anyone can *view* these URLs. Only people with repo access can change them.
