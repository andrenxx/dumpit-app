# CLAUDE.md

@AGENTS.md

Configuration for Claude Code working on **DumpIt** — an AI-powered task
manager in Brazilian Portuguese. The product lets a user dump their tasks in
natural language, have the AI parse them into a Kanban board automatically,
and close the day with a check-in routine. Differentiator: first product of
its category built natively for the PT-BR market, no configuration required.

## Project state

The repository is **scaffolded but not implemented**. The architectural
foundation is captured in ADR 0001 (spec-driven workflow). The app structure
under `src/` and `functions/` contains no source code yet. The next
contributor opens an implementation issue and proceeds via the standard
`/spec` → `/implement` → `/code-review` → `/ship` loop.

## Stack

- **Frontend framework:** React 18 (`react`, `react-dom`).
- **Build tool:** Vite 5 (`vite`, `@vitejs/plugin-react`).
- **Routing:** React Router 6 (`react-router-dom`).
- **Styling:** Tailwind CSS 3 (`tailwindcss`, `postcss`, `autoprefixer`).
- **Drag and drop:** `@dnd-kit/core` + `@dnd-kit/sortable`.
- **Backend:** Cloudflare Pages Functions (`functions/*.js`) — serverless,
  Workers runtime (V8 isolates, not Node.js). Env vars accessed via `env.*`
  on the request context, not `process.env`.
- **Database + Auth:** Supabase (Postgres + Row Level Security + magic-link auth).
  Local dev via `supabase start` or direct Supabase project.
- **AI — parsing:** `claude-haiku-4-5-20251001` (Anthropic). Used in `functions/parse-tasks.js`.
- **AI — summary:** `claude-haiku-4-5-20251001` (Anthropic). Used in `functions/checkin-summary.js`.
- **Push notifications:** Web Push API + VAPID keys (`web-push` npm package, bundled for Workers).
- **Cron (check-in push):** Cloudflare Workers Cron Trigger — configured in `wrangler.toml`,
  fires the send-checkin worker daily at 21:00 UTC (18h BRT).
- **Deploy:** Cloudflare Pages — `git push` → production automatically.
  Local dev: `wrangler pages dev dist --compatibility-date=2024-01-01`.

## Environment variables

All sensitive keys live server-side only. Never use the `VITE_` prefix for
secrets — that prefix exposes the value in the frontend bundle.

```
VITE_SUPABASE_URL          # public, protected by RLS
VITE_SUPABASE_ANON_KEY     # public, protected by RLS
SUPABASE_SERVICE_ROLE_KEY  # server-only (Workers env)
CLAUDE_API_KEY             # server-only — NEVER VITE_ prefix (Anthropic)
VAPID_PUBLIC_KEY           # server-only (Workers env)
VAPID_PRIVATE_KEY          # server-only (Workers env)
VAPID_SUBJECT              # server-only (mailto:)
```

In Cloudflare Pages Functions, server-side vars are set in the Cloudflare
Dashboard (Settings → Environment Variables) and accessed as `context.env.VAR`.
They are never in the frontend bundle. Local dev uses a `.dev.vars` file
(gitignored) instead of `.env.local`.

See `.env.example` for full reference.

## Workflow

This project follows **Spec-Driven Development with GitHub Issues as the source
of truth**. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before contributing.

The workflow is enforced at the entry point: every AI agent (Claude Code,
Cursor, Copilot, Aider, etc.) must satisfy the STOP block at the top of
[`AGENTS.md`](AGENTS.md) before editing any file. Claude Code also gates
`Edit`/`Write`/`MultiEdit` and mutating `Bash` via `PreToolUse` hooks
([`.claude/hooks/workflow-guard.sh`](.claude/hooks/workflow-guard.sh)
and
[`.claude/hooks/bash-workflow-guard.sh`](.claude/hooks/bash-workflow-guard.sh));
emergency manual edits can bypass with
`CLAUDE_CODE_DISABLE_WORKFLOW_GATE=1`.

### Skills

Skills always anchor on repo root regardless of cwd. Paths in spec §5,
ADRs, and skill outputs are root-relative.

The full workflow loop is automated by versioned skills under
[`.claude/skills/`](.claude/skills/). Run them via Claude Code:

| Skill               | Use when                                                                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `/discover`         | The pain is real but the framing is vague; output is a discovery issue.                                               |
| `/discovery-review` | A `phase:discovery` issue exists; audit before `/spec`. Required gate.                                                |
| `/spec`             | You're ready to commit; output is issue + branch + drafted spec + draft PR.                                           |
| `/spec-review`      | A spec PR exists; fresh-eyes audit before approving it.                                                               |
| `/implement`        | Spec is `spec:approved`; drive code against it with sanity gates and incremental commits.                             |
| `/code-review`      | Implementation feels done; fresh-eyes audit, applies `code:approved`.                                                 |
| `/ship`             | Both gates green; rebase-merge, close issue, clean up.                                                                |
| `/adr`              | Scaffold a new architectural decision record.                                                                         |
| `/status`           | Read-only view of in-flight work — open issues by phase, open PRs with gate labels, next-action hints.                |
| `/handoff`          | Capture in-flight state into a structured issue comment, optionally reassigning.                                      |
| `/pickup`           | Read the latest handoff, reassign to `@me`, switch to the branch, brief from comment + spec + diff.                  |
| `/decompose`        | Turn a too-big draft spec into N child sub-issues with their own branches and placeholder PRs.                        |

## Code conventions

### Language

- Code, comments, identifiers, and commits are in **English**.
- Repo and GitHub artifacts — issue titles and bodies, PR titles and
  descriptions, spec docs, ADRs — are in **English regardless of the chat
  language used during authoring**. Conversational replies may follow the
  contributor's language; anything that lands in the repo does not.
- User-facing strings (UI copy, error messages) are in **pt-BR** — the
  product is natively Portuguese.

### Commits

[Conventional Commits](https://www.conventionalcommits.org/) in English,
with the issue number as scope:

```
feat(#12): add drag-and-drop between kanban columns
fix(#15): resolve ai rate limit race condition
chore(#7): scaffold cloudflare pages functions structure
```

Imperative, lowercase, no trailing period.

### Branches

- `feat/N-<slug>` for new functionality
- `fix/N-<slug>` for bug fixes
- `chore/N-<slug>` for tooling, docs, refactors with no behavior change

`N` is the GitHub issue number; `<slug>` is short kebab-case derived from
the issue title.

### JavaScript / React

- No TypeScript in V1 (plain `.js` / `.jsx`). Introduce it via ADR if
  needed.
- No `any` workarounds or `eslint-disable` suppression without a comment
  explaining why.
- Hooks live in `src/hooks/`. Each hook owns one concern.
- Components live in `src/components/<domain>/` or `src/components/ui/`
  for base primitives.
- Pages live in `src/pages/`.
- Shared utilities and clients live in `src/lib/`.

### Cloudflare Pages Functions

- All functions live in `functions/*.js` and run in the Workers runtime
  (V8 isolates). No `process.env` — use `context.env.VAR_NAME`.
- Each function exports `onRequest(context)` (or `onRequestPost`, etc.)
  and returns a `Response` object — not Express-style `(req, res)`.
- Each function validates the Supabase JWT from the `Authorization` header
  before doing any work. Use `context.env.SUPABASE_SERVICE_ROLE_KEY`.
- Never import from `src/` in `functions/` — separate runtime contexts.
- CORS: only `dumpit.com.br`, `www.dumpit.com.br`, and
  `http://localhost:5173` (dev) are allowed origins. Return CORS headers
  on every response, including preflight `OPTIONS` requests.
- The cron trigger (`send-checkin`) is a separate Worker defined in
  `wrangler.toml` and does not live in `functions/`.

### Supabase / database

- All tables have Row Level Security enabled. RLS is the security
  boundary; never return data outside the authenticated user's scope.
- Migrations live in `supabase/migrations/NNN_<slug>.sql` (zero-padded
  3-digit sequence).
- Never embed credentials in migrations or application code. Everything
  is sourced from environment variables.

### AI calls

- Use `claude-haiku-4-5-20251001` for task parsing (`functions/parse-tasks.js`).
- Use `claude-haiku-4-5-20251001` for daily summaries (`functions/checkin-summary.js`).
- The Claude API key (`CLAUDE_API_KEY`) lives server-side only. It must
  **never** appear in any `VITE_`-prefixed variable or be referenced in
  frontend code.
- Rate limiting before every AI call: free plan gets 1 total call;
  paid plan gets 20 calls/day. Both tracked in the `ai_usage` table.

### Sanity gates

The single `package.json` at the repo root declares the gates used by
`/implement`. At minimum, it must declare `lint`, `type-check` (or skip
if plain JS), `build`, and `test`. A diff touching any `.js`/`.jsx` file
runs these gates before each commit.

### Forbidden practices

- Code without a corresponding issue and spec (for non-trivial changes).
- Hardcoded secrets — every config value is sourced from environment
  variables (see `.env.example`).
- `console.log` in committed code (use `console.warn` / `console.error`
  intentionally, or omit).
- Bypassing the conventional commit + branch convention.
- Committing directly to `main`.
- Any key prefixed with `VITE_` that contains a secret.
- AI API calls from the frontend (they must go through `functions/` workers).
- `process.env` in Workers code — use `context.env.*` instead.
