#!/usr/bin/env bash
# workflow-guard.sh — PreToolUse hook gating Edit/Write/MultiEdit before
# the spec-driven workflow has been entered.
#
# Reads the Claude Code hook payload from stdin (JSON). Blocks edits when
# the agent is on `main` or on a branch that does not match
# `<feat|fix|chore>/<N>-<slug>`. Yields silently to implement-guard.sh
# while `.claude/.implement-lock` is present.
#
# Exit codes:
#   0 — allow.
#   2 — block; stderr is shown to the agent.
#
# Spec 112 §4.2.

set -euo pipefail

# Escape hatch for emergency manual work.
if [[ "${CLAUDE_CODE_DISABLE_WORKFLOW_GATE:-}" == "1" ]]; then
  exit 0
fi

# Resolve repo root (hook is invoked from arbitrary cwd).
root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

# During /implement, the implement-lock owns the policy. Yield.
if [[ -f "$root/.claude/.implement-lock" ]]; then
  exit 0
fi

# Drain stdin so the runtime is not left waiting; payload is unused.
cat >/dev/null

branch=$(git -C "$root" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")

if [[ "$branch" == "main" ]]; then
  cat >&2 <<'EOF'
Blocked: edits on `main` are not allowed.

This project uses spec-driven development. Before editing any file you
must be on a branch named `feat/<N>-<slug>`, `fix/<N>-<slug>`, or
`chore/<N>-<slug>` with a corresponding GitHub issue and an approved
spec at `docs/specs/<N>-<slug>.md`.

Run `/spec` (or `/discover` if the framing is still vague) to create
the issue, branch, and spec scaffolding. To bypass this gate for
emergency manual work, set CLAUDE_CODE_DISABLE_WORKFLOW_GATE=1.
EOF
  exit 2
fi

if ! [[ "$branch" =~ ^(feat|fix|chore)/[0-9]+-[a-z0-9-]+$ ]]; then
  cat >&2 <<EOF
Blocked: current branch does not match the spec-driven naming convention.

Branch: $branch

Expected: \`feat/<N>-<slug>\`, \`fix/<N>-<slug>\`, or \`chore/<N>-<slug>\`,
where <N> is the GitHub issue number and <slug> is short kebab-case.

Run \`/spec\` to create the issue, branch, and spec scaffolding from a
clean state. To bypass this gate for emergency manual work, set
CLAUDE_CODE_DISABLE_WORKFLOW_GATE=1.
EOF
  exit 2
fi

exit 0
