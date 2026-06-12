# ADR 0001 — Spec-Driven Workflow

| Field  | Value    |
| ------ | -------- |
| Status | Accepted |
| Date   | 2026-06-12 |

## Context

taskdump is built by a solo founder with AI coding agents (Claude Code)
as the primary implementation driver. Without a forcing function, AI
agents drift — they add scope, skip edge cases, or implement things
that were never discussed. The cost of a wrong implementation is higher
than the cost of writing a spec upfront.

GitHub Issues are the most durable artifact in a software project —
they survive editor changes, machine changes, and agent changes. Making
them the source of truth for feature state means every contributor
(human or AI) starts from the same ground.

## Decision

We will use Spec-Driven Development: every non-trivial change requires
a GitHub issue and a spec at `docs/specs/NNN-<slug>.md` before any code
is written. The spec must be reviewed and carry `spec:approved` before
implementation begins. The workflow is enforced by `PreToolUse` hooks in
`.claude/settings.json` and by the STOP block in `AGENTS.md`.

The loop is:
`/discover` → `/discovery-review` → `/spec` → `/spec-review` →
`/implement` → `/code-review` → `/ship`

Trivial changes (≤ 10 lines, ≤ 2 files) fast-track: the issue body is
the spec, no separate file required.

## Consequences

- Every feature has a traceable issue + spec before code exists. Scope
  creep is caught at spec review, not code review.
- AI agents are constrained to the approved files list; drift is blocked
  at the tool-call level.
- Overhead is real for trivial changes, mitigated by the fast-track path.
- The full set of automated skills (in `.claude/skills/`) removes most
  of the manual ceremony.
