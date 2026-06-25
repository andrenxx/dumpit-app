# Local development setup

A step-by-step guide to get DumpIt running locally from zero.

---

## Prerequisites

| Tool | Minimum version | Check |
| ---- | --------------- | ----- |
| Node.js | 18 | `node -v` |
| npm | 9 | `npm -v` |
| Supabase project | any (free tier works) | [supabase.com](https://supabase.com) |
| Wrangler CLI | any | `wrangler -v` — optional, only needed for full-stack dev |
| Claude API key | — | [console.anthropic.com](https://console.anthropic.com) — optional, needed for AI features |

---

## 1. Clone and install

```bash
git clone https://github.com/andrenxx/dumpit.git
cd dumpit
npm ci        # reproducible install from committed lockfile
```

---

## 2. Configure environment variables

The project uses two separate env files. Both are gitignored and derived from `.env.example`:

```bash
cp .env.example .env.local    # VITE_* vars — read by Vite dev server
cp .env.example .dev.vars     # server-only vars — read by wrangler pages dev
```

### Variable reference

| Variable | File | Required | Where to find it |
| -------- | ---- | -------- | ---------------- |
| `VITE_SUPABASE_URL` | `.env.local` | Yes | Supabase dashboard → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | `.env.local` | Yes | Supabase dashboard → Project Settings → API → anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | `.dev.vars` | Yes (for auth) | Supabase dashboard → Project Settings → API → service_role key |
| `CLAUDE_API_KEY` | `.dev.vars` | No* | Anthropic Console → API Keys |
| `DEV_BYPASS` | `.dev.vars` | No | Set to `true` to skip auth and DB (see below) |
| `VAPID_PUBLIC_KEY` | `.dev.vars` | No | Not yet active — leave blank |
| `VAPID_PRIVATE_KEY` | `.dev.vars` | No | Not yet active — leave blank |
| `VAPID_SUBJECT` | `.dev.vars` | No | Not yet active — leave blank |

*Without `CLAUDE_API_KEY`, the Worker returns `502` for dump submissions. The frontend degrades gracefully (error toast shown). Everything else works.

### DEV_BYPASS escape hatch

Set `DEV_BYPASS=true` in `.dev.vars` to skip JWT verification and Supabase writes in the Worker. Useful for UI-only work when you don't have Supabase credentials set up yet. **Only active outside the `main` branch** — the Worker checks `CF_PAGES_BRANCH !== 'main'` before honouring this flag.

---

## 3. Run the Vite dev server (frontend only)

```bash
npm run dev
# → http://localhost:5173
```

This runs the React frontend with Vite's HMR. API calls (`/api/*`) are proxied to `:8788` — without the Worker running, dump submissions will fail, but the UI loads and static navigation works.

---

## 4. Run full-stack (Vite + Cloudflare Worker)

```bash
npm run build
npm run preview:fullstack
# → http://localhost:8788
```

This serves the built frontend and the Cloudflare Worker from the same port. Requires `wrangler` on your PATH. If not installed globally:

```bash
npx wrangler pages dev dist --compatibility-date=2024-01-01 --port=8788
```

In full-stack mode, `wrangler` reads `.dev.vars` automatically.

---

## 5. Verify everything is working

- [ ] `http://localhost:5173` (or `:8788`) loads the landing page
- [ ] Signing up creates a user visible in the Supabase Auth dashboard
- [ ] Submitting a dump on the board triggers `POST /api/parse-tasks` (visible in browser DevTools → Network)
- [ ] `npm test` exits 0 (runs Vitest unit tests)
- [ ] `npm run lint` exits 0

---

## Troubleshooting

**`wrangler: command not found`**
Install globally (`npm install -g wrangler`) or prefix with `npx`: `npx wrangler pages dev dist ...`.

**`502` from `/api/parse-tasks`**
The Worker couldn't reach the Claude API. Check that `CLAUDE_API_KEY` is set in `.dev.vars`, or set `DEV_BYPASS=true` to skip the AI call entirely.

**`401` from `/api/parse-tasks`**
The Worker rejected the Supabase JWT. Check that `SUPABASE_SERVICE_ROLE_KEY` is correct in `.dev.vars`.

**Changes not reflected in full-stack mode**
Run `npm run build` again before `npm run preview:fullstack` — Wrangler serves the `dist/` folder, which is not hot-reloaded.
