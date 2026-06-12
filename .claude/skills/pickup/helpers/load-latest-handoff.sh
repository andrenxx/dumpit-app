#!/usr/bin/env bash
# load-latest-handoff.sh — Output the body of the most recent handoff comment.
#
# Usage:
#   load-latest-handoff.sh <issue-number>
#
# Output:
#   On stdout: the full body of the latest handoff comment found on the
#   issue. The body includes the marker line ("### 🔁 Handoff —") so the
#   caller can verify or display it.
#
# Exit:
#   0 — handoff comment found and printed.
#   1 — usage error or no handoff comment exists on the issue.
#
# Notes:
#   - "Most recent" is by `created_at` (ascending sort, last entry).
#   - Marker matching is anchored: comments must begin with the marker.
#   - No mutation. Pure read.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <issue-number>" >&2
  exit 1
fi

issue="$1"

if ! [[ "$issue" =~ ^[0-9]+$ ]] || [[ "$issue" -lt 1 ]]; then
  echo "Error: issue-number must be a positive integer (got: $issue)" >&2
  exit 1
fi

repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner)

# Fetch all comments via paginated API; sort ascending; pick the last
# whose body starts with the marker.
body=$(gh api "repos/$repo/issues/$issue/comments" --paginate \
  --jq '. | sort_by(.created_at) | map(select(.body | startswith("### 🔁 Handoff —"))) | last | .body // empty')

if [[ -z "$body" ]]; then
  echo "Error: no handoff comment found on issue #$issue (no comment starts with '### 🔁 Handoff —')" >&2
  exit 1
fi

echo "$body"
