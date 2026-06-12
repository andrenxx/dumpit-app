#!/usr/bin/env bash
# post-handoff.sh — Post a handoff comment on an issue and reassign.
#
# Usage:
#   post-handoff.sh <issue-number> <body-file> [<target-login>]
#
# Behavior:
#   - Posts the body file content as a comment on <issue-number>.
#   - Reassignment:
#       * <target-login> non-empty → add target as assignee, remove @me.
#       * <target-login> empty/omitted → only remove @me (issue becomes
#         unassigned, or keeps any other existing assignees).
#   - Does NOT validate that the comment body starts with the canonical
#     handoff marker — the SKILL.md is responsible for shape; this
#     helper is the transport. (A misshapen handoff still posts; the
#     pickup helper just won't find it via marker.)
#   - Idempotent: re-running with the same body posts a second comment
#     (GitHub does not collapse). The convention is one handoff per
#     transition; the user controls cadence.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -lt 2 || $# -gt 3 ]]; then
  echo "Usage: $0 <issue-number> <body-file> [<target-login>]" >&2
  exit 1
fi

issue="$1"
body_file="$2"
target="${3:-}"

if ! [[ "$issue" =~ ^[0-9]+$ ]] || [[ "$issue" -lt 1 ]]; then
  echo "Error: issue-number must be a positive integer (got: $issue)" >&2
  exit 1
fi

if [[ ! -f "$body_file" ]]; then
  echo "Error: body file not found: $body_file" >&2
  exit 1
fi

# Strip a leading @ from target if present.
if [[ -n "$target" ]]; then
  target="${target#@}"
fi

gh issue comment "$issue" --body-file "$body_file" >/dev/null

# Resolve current GitHub login for @me to remove it from assignees.
me=$(gh api user --jq .login)

if [[ -n "$target" ]]; then
  gh issue edit "$issue" --add-assignee "$target" --remove-assignee "$me" >/dev/null
  echo "Comment posted on issue #$issue. Assignee: @$me → @$target."
else
  gh issue edit "$issue" --remove-assignee "$me" >/dev/null 2>&1 || true
  echo "Comment posted on issue #$issue. Assignee removed (@$me); issue is now unassigned (or carries other assignees)."
fi
