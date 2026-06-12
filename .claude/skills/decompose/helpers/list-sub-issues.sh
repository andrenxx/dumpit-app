#!/usr/bin/env bash
# list-sub-issues.sh — List the sub-issues of a parent (GraphQL).
#
# Usage:
#   list-sub-issues.sh <parent-issue-number>
#
# Output:
#   JSON array on stdout, each element:
#     {"number": 42, "title": "...", "state": "OPEN"|"CLOSED"}
#
# Exit:
#   0 — success (output may be `[]` if there are no sub-issues).
#   1 — usage error or gh/GraphQL failure.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <parent-issue-number>" >&2
  exit 1
fi

parent="$1"

if ! [[ "$parent" =~ ^[0-9]+$ ]] || [[ "$parent" -lt 1 ]]; then
  echo "Error: parent-issue-number must be a positive integer (got: $parent)" >&2
  exit 1
fi

parent_id=$(gh issue view "$parent" --json id --jq .id)

gh api graphql \
  -f query='
    query($id: ID!) {
      node(id: $id) {
        ... on Issue {
          subIssues(first: 100) {
            nodes { number title state }
          }
        }
      }
    }' \
  -F id="$parent_id" \
  --jq '.data.node.subIssues.nodes // []'
