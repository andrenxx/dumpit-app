# Spec 072 — Add local dev setup guide

| Field  | Value                                                              |
| ------ | ------------------------------------------------------------------ |
| Issue  | [#52](https://github.com/andrenxx/dumpit/issues/52)               |
| Branch | `chore/52-add-local-dev-setup-guide`                               |
| Status | Draft — awaiting review                                            |
| Type   | chore                                                              |

## 1. Context

There is no `README.md` in the repo root, and `CONTRIBUTING.md` contains only a 5-line "First-time setup" snippet that omits prerequisites, env var values, Supabase setup, and how to verify each service is running. A new contributor (human or AI agent) starting cold has no self-contained guide to reach a working local environment. The discovery (#52) targets this gap: a `docs/SETUP.md` that a developer with no prior DumpIt context can follow within 30 minutes to have Vite + Cloudflare Worker dev + Supabase all running.

Key facts about the stack that the guide must cover:
- **Two env files** — `.env.local` (VITE_ vars, read by Vite) and `.dev.vars` (server-only vars, read by `wrangler pages dev`). Both are derived from `.env.example`.
- **Cloudflare Pages / Wrangler** — `npm run preview:fullstack` runs `wrangler pages dev dist ...`; requires `wrangler` CLI installed globally or via npx.
- **Supabase** — the project uses the hosted Supabase instance (not local Docker). Credentials come from the Supabase dashboard.
- **DEV_BYPASS** — `DEV_BYPASS=true` in `.dev.vars` skips auth and DB writes in the Worker, useful for UI-only local work without valid Supabase credentials.
- **Claude API key** — required in `.dev.vars` for the AI parse endpoint; without it the Worker returns 502 for dump submissions (frontend degrades gracefully).
- **npm ci** — now that `package-lock.json` is committed (spec 070), contributors should use `npm ci` instead of `npm install` for reproducible installs.

## 2. Goals

- `docs/SETUP.md` exists and covers all prerequisites, env var setup, and how to start each service.
- A developer with no prior context can clone the repo, follow the guide, and reach a working Vite dev server (at minimum) in one read-through.
- `README.md` exists in the repo root and links to `docs/SETUP.md` for setup instructions.

## 2.5 Validation strategy

The oracle is the document itself: a reviewer reads `docs/SETUP.md` top-to-bottom and can answer "yes" to every step without needing to ask anyone. No automated gate applies to a docs-only change; `npm run lint` and `npm test` still run and must exit 0 (no regressions from adding markdown files).

## 3. Non-goals

- Setting up a local Supabase Docker instance — the project uses hosted Supabase; local Docker is out of scope.
- Documenting the spec-driven workflow — already covered in `CONTRIBUTING.md`.
- Documenting CI/CD pipeline — out of scope for a local dev guide.
- Web Push / VAPID key setup (`VAPID_*` vars) — those features are not yet shipped; the guide notes the vars but defers their setup to when the feature lands.
- A `README.md` with full product description — the README created here is intentionally minimal (name, one-line description, link to SETUP.md). Product docs are out of scope.

## 4. Design

### 4.1 `docs/SETUP.md` — structure

The guide follows a linear "zero to running" path with these sections:

**Prerequisites**
List with minimum versions:
- Node.js ≥ 18 (check with `node -v`)
- npm ≥ 9 (comes with Node; used for `npm ci`)
- A Supabase project (free tier works) — dashboard at supabase.com
- Optional: Wrangler CLI for full-stack dev (`npm install -g wrangler` or `npx wrangler`)
- Optional: Claude API key for AI features (console.anthropic.com)

**1. Clone and install**
```bash
git clone https://github.com/andrenxx/dumpit.git
cd dumpit
npm ci          # reproducible install from committed lockfile
```

**2. Configure environment variables**
Explain the two-file system (`.env.local` for Vite, `.dev.vars` for Worker):
```bash
cp .env.example .env.local
cp .env.example .dev.vars
```
Table of required vs optional vars per file, where to find each value, and which can be left blank for UI-only work. Highlight `DEV_BYPASS=true` as the escape hatch for working without Supabase creds.

**3. Run the Vite dev server (frontend only)**
```bash
npm run dev     # http://localhost:5173
```
Note: without Supabase credentials, the app shows the landing page but API calls fail. Use `DEV_BYPASS=true` in `.dev.vars` only when running full-stack (step 4).

**4. Run full-stack (Vite + Cloudflare Worker)**
```bash
npm run build
npm run preview:fullstack   # http://localhost:8788
```
Explain: Vite proxies `/api` to `:8788`; this is needed to test dump submission, auth flow, and freemium gate. Requires `wrangler` on PATH or `npx wrangler`.

**5. Verify everything is working**
Checklist:
- [ ] `http://localhost:5173` loads the landing page
- [ ] Signing up creates a user in the Supabase Auth dashboard
- [ ] Submitting a dump on the board calls `POST /api/parse-tasks` (visible in browser DevTools Network tab)
- [ ] `npm test` exits 0 (4 tests pass)
- [ ] `npm run lint` exits 0

**Troubleshooting** (short section)
- `wrangler: command not found` → install globally or use `npx wrangler pages dev ...`
- `502 from /api/parse-tasks` → check `CLAUDE_API_KEY` in `.dev.vars` or set `DEV_BYPASS=true`
- `401 from /api/parse-tasks` → check `SUPABASE_SERVICE_ROLE_KEY` in `.dev.vars`

### 4.2 `README.md` — minimal root file

No README currently exists. Add a minimal one:
- Project name and one-line description
- Tech stack badges (optional, plain text is fine)
- Link to `docs/SETUP.md` for setup
- Link to `CONTRIBUTING.md` for the development workflow

## 4.5 UX decision

N/A — discovery marked ux: not-applicable.

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `docs/SETUP.md` | Create | Local dev setup guide — the main deliverable |
| `README.md` | Create | Minimal root README linking to SETUP.md and CONTRIBUTING.md |

## 6. Acceptance

- [ ] `docs/SETUP.md` exists and has all five sections: Prerequisites, Clone+install, Env vars, Dev server, Full-stack.
- [ ] Env var table in SETUP.md covers all vars in `.env.example` (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, CLAUDE_API_KEY, VAPID_*) with source and required/optional status.
- [ ] `DEV_BYPASS=true` escape hatch is explained.
- [ ] Verification checklist in SETUP.md is present and includes at least: app loads, auth works, `npm test` passes.
- [ ] `README.md` exists in repo root and links to `docs/SETUP.md`.
- [ ] `npm run lint` exits 0.
- [ ] `npm test` exits 0.

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| Guide becomes stale as the stack evolves | Acceptable — the guide is a snapshot. Future specs that add env vars should update SETUP.md as part of their Files table |
| VAPID vars documented but feature not shipped yet | Guide notes them as "not yet active — leave blank" to avoid confusion |
| Reviewer cannot run the full guide end-to-end during review | The acceptance criteria are structural (sections present, vars listed, links work) and do not require a live run for approval |

## 8. Rollout

Single PR, two commits:
1. `chore(#52): add docs/SETUP.md — local dev setup guide`
2. `chore(#52): add minimal README.md linking to SETUP.md`

---

**Reviewer checklist:**

- Goals are achievable inside this PR.
- Non-goals are explicit; nothing snuck in.
- File list is complete.
- Acceptance criteria are objective.
