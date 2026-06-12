# STOP — read this before editing any file

This project uses spec-driven development. Before editing, writing, or
committing any file you MUST verify all of the following:

1. You are on a branch named `feat/<N>-<slug>`, `fix/<N>-<slug>`, or
   `chore/<N>-<slug>` (NOT `main`).
2. A GitHub issue `#<N>` exists for this work.
3. A spec at `docs/specs/<N>-<slug>.md` exists and carries
   `spec:approved`, OR you are explicitly drafting that spec right now.

If any of these is missing, STOP. Do not edit. Run `/spec` (or
`/discover` if the framing is still vague) to create the missing
artifacts. The full workflow is described in `CLAUDE.md` and
`CONTRIBUTING.md`.

This rule applies to every AI coding agent (Claude Code, Cursor,
Copilot, Aider, etc.) operating on this repository. Claude Code also
enforces it via `PreToolUse` hooks in `.claude/settings.json`; other
agents are expected to honor it on their own.

# Workflow

This project follows Spec-Driven Development with GitHub Issues as the
source of truth. Before opening a PR, read [`CONTRIBUTING.md`](CONTRIBUTING.md)
and the relevant spec in [`docs/specs/`](docs/specs/). Architectural
constraints live in [`docs/architecture/decisions/`](docs/architecture/decisions/).

# Product context

**taskdump** is a conversational AI task manager in PT-BR. The user
dumps what they have to do in natural language; the AI parses it into an
organized Kanban. Freemium: free plan allows unlimited manual Kanban +
one AI call. Paid plan (R$25/mês) unlocks unlimited AI calls and daily
AI summaries.

Stack: React 18 + Vite 5 (frontend), Vercel Functions (backend API),
Supabase (Postgres + Auth + RLS), Claude API (Anthropic), Stripe
(payments), Web Push API (push notifications). Deploy: Vercel.

# Frontend work

Before writing UI code, read the **JavaScript / React** subsection under
[Code conventions](CLAUDE.md#code-conventions) in `CLAUDE.md`. User-facing
strings must be in pt-BR. All AI calls must go through `api/` functions —
never call the Claude API or expose secrets in frontend code.

# Vercel Functions

Before writing or modifying API functions, read the **Vercel Functions**
subsection under [Code conventions](CLAUDE.md#code-conventions) in
`CLAUDE.md`. Every function must validate the Supabase JWT before
processing, and must include CORS headers allowing only the specified
origins.
