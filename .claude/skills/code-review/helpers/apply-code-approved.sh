#!/usr/bin/env bash
# apply-code-approved.sh — Add the code:approved label and post a pass comment.
#
# Usage:
#   apply-code-approved.sh <pr-number> <summary>
#
# Behavior:
#   - Adds the label code:approved to the PR (idempotent).
#   - Posts a single PR comment with the summary text.
#   - On gh failure, surfaces stderr and exits non-zero.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <pr-number> <summary>" >&2
  exit 1
fi

pr="$1"
summary="$2"

if ! [[ "$pr" =~ ^[0-9]+$ ]] || [[ "$pr" -lt 1 ]]; then
  echo "Error: pr-number must be a positive integer (got: $pr)" >&2
  exit 1
fi

if [[ -z "$summary" ]]; then
  echo "Error: summary must not be empty" >&2
  exit 1
fi

gh pr edit "$pr" --add-label "code:approved" >/dev/null

# Heredoc avoids the quoting class of bug fixed in #12 (see commit 88ce29c).
gh pr comment "$pr" --body "$(cat <<EOF
✅ **code:approved** — $summary

_Posted by \`apply-code-approved.sh\`._
EOF
)"
