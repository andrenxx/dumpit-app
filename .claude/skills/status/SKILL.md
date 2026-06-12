---
name: status
description: Read-only "what am I working on, and what's the next action for each thing?" query. Lists open issues by phase and open PRs with gate labels, plus deterministic next-action hints. Never mutates state.
---

# /status

## When to use

Any time you need a quick view of in-flight work — after a context
switch, at the start of a session, before stand-up, or to answer "what
should I do next?" without reading the spec.

The skill is read-only. It never adds labels, posts comments, closes
issues, or merges PRs.

## Inputs

- `/status` — uses `@me`.
- `/status @<user>` — view someone else's work.

## Workflow

### 1. Resolve the user

Default `@me`. If a literal `@<login>` is provided, pass it through.

### 2. Query GitHub

```bash
.claude/skills/status/helpers/query-my-work.sh [<user>] > /tmp/status.json
```

The helper makes two `gh` calls (issues + PRs) and combines them into
JSON. `<user>` defaults to `@me` when omitted.

### 3. Format and display

```bash
.claude/skills/status/helpers/format-status.sh /tmp/status.json
```

The helper reads the JSON, groups issues by phase, lists PRs with
their gate label state, and emits a deterministic next-action hint per
item using the state machine in spec 023 §4.4.

Print the helper's output verbatim to the user. Do **not** rewrite or
embellish — the format is the contract.

### 4. (Optional) suggest one specific next step

If the user asks "what should I do next?" after seeing the status, you
may identify the highest-priority next action — typically the one with
the simplest hint (e.g., a PR with both gate labels → run `/ship`). Do
this only when asked; the unembellished status is the default output.

## Anti-patterns

- **Mutating state.** No labels, no comments, no merges. The skill is a
  query.
- **Rewriting the helper output.** The format is the contract; LLM
  prose drift would make the output unreliable to scan.
- **Inventing a hint outside the state machine.** When the helper emits
  `(unrecognized state — no suggestion)`, surface that verbatim. Add
  the case to the state machine via a follow-up spec, not in this
  skill's runtime.
- **Caching the result.** Each invocation re-queries; a "cached"
  status is a stale status.

## Output contract

On success: a plain-text status report with the shape documented in
spec 023 §4.3.

On failure (gh auth missing, repo unresolvable, jq missing): surface the
helper's stderr verbatim and stop. No partial output.

## See also

- [`examples/README.md`](examples/README.md) — sample transcript.
- Spec [023 §4.4](../../../docs/specs/023-status-skill.md) — the canonical state machine.
- [`/handoff`](../handoff/SKILL.md) — Phase 2 (planned), the natural follow-up when status reveals work to pass off.
