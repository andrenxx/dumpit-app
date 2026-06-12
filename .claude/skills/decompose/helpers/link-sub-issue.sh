#!/usr/bin/env bash
# link-sub-issue.sh — Add a child issue as a sub-issue of a parent (GraphQL).
#
# Usage:
#   link-sub-issue.sh <parent-issue-number> <child-issue-number>
#
# Behavior:
#   - Resolves the GraphQL node IDs of both issues via `gh issue view`.
#   - Calls the GraphQL `addSubIssue` mutation.
#   - Prints a one-line confirmation on success.
#
# Exit:
#   0 — sub-issue link created.
#   1 — usage error or gh/GraphQL failure (stderr explains).
#
# Notes:
#   - GitHub's REST API does not (yet) expose first-class sub-issue endpoints
#     as of 2026; GraphQL is the canonical surface.
#   - The mutation is idempotent at the GitHub level — re-linking an
#     already-linked child returns success without changes.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <parent-issue-number> <child-issue-number>" >&2
  exit 1
fi

parent="$1"
child="$2"

for n in "$parent" "$child"; do
  if ! [[ "$n" =~ ^[0-9]+$ ]] || [[ "$n" -lt 1 ]]; then
    echo "Error: issue numbers must be positive integers (got: $n)" >&2
    exit 1
  fi
done

parent_id=$(gh issue view "$parent" --json id --jq .id)
child_id=$(gh issue view "$child" --json id --jq .id)

gh api graphql \
  -f query='
    mutation($parent: ID!, $child: ID!) {
      addSubIssue(input: {issueId: $parent, subIssueId: $child}) {
        issue { number }
        subIssue { number }
      }
    }' \
  -F parent="$parent_id" \
  -F child="$child_id" \
  >/dev/null

echo "Linked: #$child is now a sub-issue of #$parent."
