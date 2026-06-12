#!/usr/bin/env bash
# bash-write-guard.sh — PreToolUse hook gating Bash during /implement.
#
# Reads the Claude Code hook payload from stdin (JSON with tool_input.command).
# Extracts write-target paths via .claude/hooks/bash-write-targets.py and,
# while .claude/.implement-lock is present, blocks writes to docs/specs/*.md
# or to paths outside the lock's files[]. Read-only commands always pass.
#
# Exit codes:
#   0 — allow.
#   2 — block; stderr is shown to the agent.
#
# Spec 055 §4.1.

set -euo pipefail

root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
lock="${IMPLEMENT_LOCK_PATH:-$root/.claude/.implement-lock}"

# No lock → no policy. Allow.
if [[ ! -f "$lock" ]]; then
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

# Empty / unparseable command → allow (do not block on parser failures).
if [[ -z "$command_str" ]]; then
  exit 0
fi

parser="$root/.claude/hooks/bash-write-targets.py"
parser_out=$(printf '%s' "$command_str" | python3 "$parser")

# No write-targets and no unknowns → allow (read-only).
if [[ -z "$parser_out" ]]; then
  exit 0
fi

# Unknown construct under lock → block.
unknowns=$(printf '%s\n' "$parser_out" | grep '^__UNKNOWN__:' || true)
if [[ -n "$unknowns" ]]; then
  reasons=$(printf '%s\n' "$unknowns" | sed 's/^__UNKNOWN__://')
  cat >&2 <<EOF
Blocked: bash command contains a construct opaque to the implement guard.

Reasons:
$reasons

The guard cannot determine which paths this command would mutate. During
/implement, dynamic redirects, eval, bash -c, and xargs-into-mutators are
blocked conservatively. Restructure the command with literal paths, or
stop and edit the spec to add the path under §5 Files (which invalidates
spec:approved and requires /spec-review).
EOF
  exit 2
fi

# Check each write-target. Allowlist matching is delegated to
# match-allowlist.py (spec 131) so glob patterns in the lock cover
# files that did not yet exist when the lock was acquired.
matcher="$root/.claude/hooks/match-allowlist.py"
while IFS= read -r raw; do
  [[ -z "$raw" ]] && continue
  # Normalize: strip repo-root absolute prefix, drop ./, resolve trivial ..
  case "$raw" in
    /*)
      if [[ "$raw" == "$root/"* ]]; then
        rel="${raw#"$root"/}"
      else
        cat >&2 <<EOF
Blocked: '$raw' is outside the repo root.

Writes outside the repo during /implement are not allowed. The implement
guard is scoped to the working tree.
EOF
        exit 2
      fi
      ;;
    *)
      rel="${raw#./}"
      ;;
  esac

  # Block all spec edits during /implement.
  if [[ "$rel" == docs/specs/*.md ]]; then
    cat >&2 <<EOF
Blocked: spec edits are not allowed during /implement.

Path: $rel

To change the spec, stop /implement, run /spec-review, then resume
/implement. Editing the spec mid-run invalidates spec:approved and
breaks the contract /code-review audits against.
EOF
    exit 2
  fi

  # Block paths not in the allow-list.
  if ! python3 "$matcher" "$rel" "$lock"; then
    cat >&2 <<EOF
Blocked: '$rel' is not in the current spec's §5 Files list.

If this file genuinely needs to change to satisfy the spec, stop and
edit the spec to add it (which invalidates spec:approved and requires
/spec-review). If the change is unrelated, stop and reframe — drift is
the failure mode this guard exists to catch.
EOF
    exit 2
  fi
done <<<"$parser_out"

exit 0
