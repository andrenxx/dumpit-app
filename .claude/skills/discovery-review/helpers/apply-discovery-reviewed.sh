#!/usr/bin/env bash
# apply-discovery-reviewed.sh — Add the phase:discovery-reviewed label and post a pass comment.
#
# Usage:
#   apply-discovery-reviewed.sh <issue-number> <summary>
#
# Behavior:
#   - Adds the label phase:discovery-reviewed to the issue (idempotent —
#     re-applying does not error in gh).
#   - Posts a single issue comment with the summary text and a marker.
#   - On gh failure, surfaces stderr and exits non-zero.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <issue-number> <summary>" >&2
  exit 1
fi

n="$1"
summary="$2"

if ! [[ "$n" =~ ^[0-9]+$ ]] || [[ "$n" -lt 1 ]]; then
  echo "Error: issue number must be a positive integer (got: $n)" >&2
  exit 1
fi

if [[ -z "$summary" ]]; then
  echo "Error: summary must not be empty" >&2
  exit 1
fi

gh issue edit "$n" --add-label "phase:discovery-reviewed" >/dev/null

gh issue comment "$n" --body "$(cat <<EOF
✅ **phase:discovery-reviewed** — $summary

_Posted by \`apply-discovery-reviewed.sh\`._
EOF
)"
