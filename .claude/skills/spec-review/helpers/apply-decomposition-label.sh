#!/usr/bin/env bash
# apply-decomposition-label.sh — Add the spec:requires-decomposition label
# and post a verdict comment.
#
# Usage:
#   apply-decomposition-label.sh <pr-number> <summary>
#
# Behavior:
#   - Adds the label spec:requires-decomposition to the PR.
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

gh pr edit "$pr" --add-label "spec:requires-decomposition" >/dev/null

body=$(cat <<EOF
🧩 **spec:requires-decomposition** — $summary

_Posted by \`apply-decomposition-label.sh\`. Run \`/decompose\` to open child issues._
EOF
)
gh pr comment "$pr" --body "$body"
