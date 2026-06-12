#!/usr/bin/env bash
# check-spec-touched.sh — Detect spec edits in code commits since spec:approved.
#
# Usage:
#   check-spec-touched.sh <pr-number> <spec-path>
#
# Output:
#   On stdout: the list of commit hashes (newest first) that modified
#   the spec file *after* the spec:approved label was applied. Empty
#   stdout means no spec edits since approval.
#
# Exit:
#   0 — always (the presence/absence of output is the signal).
#   1 — usage error or missing artifacts.
#
# Notes:
#   - The "since spec:approved was applied" timestamp is taken from the
#     gh API (PR timeline events). When the label was never applied, all
#     commits that touched the spec are reported.
#   - The spec-path is taken at face value; the helper does not validate
#     that the spec is the one this PR claims.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <pr-number> <spec-path>" >&2
  exit 1
fi

pr="$1"
spec="$2"

if ! [[ "$pr" =~ ^[0-9]+$ ]] || [[ "$pr" -lt 1 ]]; then
  echo "Error: pr-number must be a positive integer (got: $pr)" >&2
  exit 1
fi

if [[ ! -f "$spec" ]]; then
  echo "Error: spec file not found: $spec" >&2
  exit 1
fi

repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner)

# Find the most recent timestamp at which spec:approved was applied to this PR.
# gh's pr view exposes timelineItems via a GraphQL extension; we use the API.
since=$(gh api "repos/$repo/issues/$pr/timeline" --paginate \
  --jq '[.[] | select(.event=="labeled" and .label.name=="spec:approved") | .created_at] | last' \
  2>/dev/null || true)

# If the label was never applied, list all commits touching the spec on
# this branch (vs origin/main).
git fetch origin main --quiet

if [[ -z "$since" || "$since" == "null" ]]; then
  git log origin/main..HEAD --pretty=format:'%H' -- "$spec"
  exit 0
fi

# List commits that touched the spec since the approval timestamp.
# Convert ISO 8601 to a git --since-friendly form (it accepts ISO 8601).
git log origin/main..HEAD --since="$since" --pretty=format:'%H' -- "$spec"
