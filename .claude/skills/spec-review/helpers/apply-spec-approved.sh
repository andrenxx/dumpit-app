#!/usr/bin/env bash
# apply-spec-approved.sh — Add the spec:approved label and post a pass comment.
#
# Usage:
#   apply-spec-approved.sh <pr-number> <summary>
#
# Behavior:
#   - Adds the label spec:approved to the PR.
#   - Posts a single PR comment with the summary text.
#   - Both operations are idempotent: if the label is already present or
#     the same comment exists, the helper still exits 0.

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

# Label add is idempotent in gh — re-adding does not error.
gh pr edit "$pr" --add-label "spec:approved" >/dev/null

# Comment with a marker so we can recognize prior approvals on retry.
body=$(cat <<EOF
✅ **spec:approved** — $summary

_Posted by \`apply-spec-approved.sh\`._
EOF
)
gh pr comment "$pr" --body "$body"
