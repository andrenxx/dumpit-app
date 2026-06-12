#!/usr/bin/env bash
# load-spec.sh — Resolve the spec file path for a given PR or current branch.
#
# Usage:
#   load-spec.sh           # uses current branch
#   load-spec.sh <pr-number>
#
# Output:
#   Absolute or repo-relative path to the spec file.
#
# Behavior:
#   - With <pr-number>: queries the PR's changed files, returns the first
#     match under docs/specs/ that is not _template.md.
#   - Without <pr-number>: diffs the current branch against origin/main and
#     returns the first matching spec file.
#   - Exits non-zero if zero or multiple specs are touched.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

repo_root=$(git rev-parse --show-toplevel)

if [[ $# -eq 0 ]]; then
  git fetch origin main --quiet
  changed=$(git diff --name-only origin/main...HEAD)
elif [[ $# -eq 1 ]]; then
  pr="$1"
  if ! [[ "$pr" =~ ^[0-9]+$ ]] || [[ "$pr" -lt 1 ]]; then
    echo "Error: pr-number must be a positive integer (got: $pr)" >&2
    exit 1
  fi
  changed=$(gh pr diff "$pr" --name-only)
else
  echo "Usage: $0 [pr-number]" >&2
  exit 1
fi

specs=$(echo "$changed" | grep -E '^docs/specs/[0-9]{3}-[a-z0-9-]+\.md$' || true)

count=$(echo "$specs" | grep -cE '.' || true)

if [[ "$count" -eq 0 ]]; then
  echo "Error: no spec files touched in the requested change set" >&2
  exit 1
fi

if [[ "$count" -gt 1 ]]; then
  echo "Error: multiple spec files touched; expected exactly one" >&2
  echo "$specs" >&2
  exit 1
fi

echo "$repo_root/$specs"
