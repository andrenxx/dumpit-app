#!/usr/bin/env bash
# bash-workflow-guard.sh — PreToolUse hook gating mutating Bash commands
# before the spec-driven workflow has been entered.
#
# Reads the Claude Code hook payload from stdin (JSON with
# tool_input.command). Read-only commands always pass. Mutating commands
# are blocked when the agent is on `main` or on a branch that does not
# match `<feat|fix|chore>/<N>-<slug>`. Yields silently to
# bash-write-guard.sh while `.claude/.implement-lock` is present.
#
# Exit codes:
#   0 — allow.
#   2 — block; stderr is shown to the agent.
#
# Spec 112 §4.2.

set -euo pipefail

if [[ "${CLAUDE_CODE_DISABLE_WORKFLOW_GATE:-}" == "1" ]]; then
  exit 0
fi

root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

# During /implement, bash-write-guard owns the policy. Yield.
if [[ -f "$root/.claude/.implement-lock" ]]; then
  exit 0
fi

payload=$(cat)

command_str=$(printf '%s' "$payload" | python3 -c '
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    sys.exit(0)
print((d.get("tool_input") or {}).get("command") or "")
')

if [[ -z "$command_str" ]]; then
  exit 0
fi

parser="$root/.claude/hooks/bash-write-targets.py"
parser_out=$(printf '%s' "$command_str" | python3 "$parser")

# Read-only command (no write targets, no opaque constructs) → allow.
if [[ -z "$parser_out" ]]; then
  exit 0
fi

branch=$(git -C "$root" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")

if [[ "$branch" == "main" ]]; then
  cat >&2 <<'EOF'
Blocked: mutating bash commands on `main` are not allowed.

This project uses spec-driven development. Before running commands
that modify files (or that commit/push to `main`) you must be on a
branch named `feat/<N>-<slug>`, `fix/<N>-<slug>`, or
`chore/<N>-<slug>`.

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

Expected: \`feat/<N>-<slug>\`, \`fix/<N>-<slug>\`, or \`chore/<N>-<slug>\`.

Run \`/spec\` to create the issue, branch, and spec scaffolding from a
clean state. To bypass this gate for emergency manual work, set
CLAUDE_CODE_DISABLE_WORKFLOW_GATE=1.
EOF
  exit 2
fi

exit 0
