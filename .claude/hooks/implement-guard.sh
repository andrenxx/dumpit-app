#!/usr/bin/env bash
# implement-guard.sh — PreToolUse hook gating Edit/Write/MultiEdit during /implement.
#
# Reads the Claude Code hook payload from stdin (JSON with tool_name and
# tool_input.file_path). When .claude/.implement-lock is present, blocks
# edits to docs/specs/*.md and to paths outside the lock's files[].
#
# Exit codes:
#   0 — allow.
#   2 — block; stderr is shown to the agent.
#
# Spec 049 §4.2.

set -euo pipefail

# Resolve repo root (hook is invoked from arbitrary cwd).
root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
lock="$root/.claude/.implement-lock"

# No lock → no policy. Allow.
if [[ ! -f "$lock" ]]; then
  exit 0
fi

payload=$(cat)

# Extract file_path from tool_input. Handle Edit/Write/MultiEdit
# uniformly (all use file_path at the top of tool_input).
file_path=$(printf '%s' "$payload" | python3 -c '
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    sys.exit(0)
fp = (d.get("tool_input") or {}).get("file_path") or ""
print(fp)
')

# No file_path (unexpected payload) → allow; do not block on parser
# failures.
if [[ -z "$file_path" ]]; then
  exit 0
fi

# Normalize to repo-relative POSIX path.
case "$file_path" in
  /*)
    rel="${file_path#"$root"/}"
    ;;
  *)
    rel="${file_path#./}"
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

# Block paths not in the allow-list. Glob-aware match (spec 131):
# patterns in the lock match via fnmatch / `**`, not literal compare,
# so globs in §5 that resolved to nothing at acquisition time still
# allow the files they were meant to cover.
if ! python3 "$root/.claude/hooks/match-allowlist.py" "$rel" "$lock"; then
  cat >&2 <<EOF
Blocked: '$rel' is not in the current spec's §5 Files list.

If this file genuinely needs to change to satisfy the spec, stop and
edit the spec to add it (which invalidates spec:approved and requires
/spec-review). If the change is unrelated, stop and reframe — drift is
the failure mode this guard exists to catch.
EOF
  exit 2
fi

exit 0
