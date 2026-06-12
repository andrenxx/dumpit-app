#!/usr/bin/env bash
# open-spec-pr.sh — Open a draft PR for a feature on the current branch.
#
# Usage:
#   open-spec-pr.sh <issue-number> <feature-title> <branch-type>
#
# Arguments:
#   <branch-type> — one of: feat, fix, chore. Becomes the PR title prefix
#                   (`feat:`, `fix:`, `chore:`). Resolved by SKILL.md
#                   (see spec 014).
#
# Output:
#   PR URL on stdout.
#
# Behavior:
#   - Title:  "<type>: <feature-title> (#<N>)"
#   - Base:   main
#   - Head:   current branch
#   - Draft:  yes
#   - Body:   summary, link to spec, link to issue, "Closes #<N>",
#             two-checkbox review checklist.
#   - Refuses any <branch-type> other than feat|fix|chore.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -ne 3 ]]; then
  echo "Usage: $0 <issue-number> <feature-title> <branch-type>" >&2
  exit 1
fi

n="$1"
title="$2"
type="$3"

if ! [[ "$n" =~ ^[0-9]+$ ]] || [[ "$n" -lt 1 ]]; then
  echo "Error: issue number must be a positive integer (got: $n)" >&2
  exit 1
fi

if [[ -z "$title" ]]; then
  echo "Error: feature-title must not be empty" >&2
  exit 1
fi

if ! [[ "$type" =~ ^(feat|fix|chore)$ ]]; then
  echo "Error: branch-type must be one of: feat, fix, chore (got: $type)" >&2
  exit 2
fi

branch=$(git branch --show-current)
if [[ -z "$branch" ]] || [[ "$branch" == "main" ]]; then
  echo "Error: refusing to open a PR from base branch (current: $branch)" >&2
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
shared="$script_dir/../../_shared/helpers"
repo=$("$shared/repo-info.sh")

body=$(cat <<EOF
## Summary

Implementation of feature [#$n](https://github.com/$repo/issues/$n). The spec lives in this branch under \`docs/specs/\`. Two reviews gate the merge: \`/spec-review\` then \`/code-review\` (Phase 1.2 — manual until that lands).

## Review checklist

- [ ] \`spec:approved\` — spec audited and accepted
- [ ] \`code:approved\` — implementation audited and accepted

Closes #$n
EOF
)

gh pr create \
  --title "$type: $title (#$n)" \
  --base main \
  --head "$branch" \
  --draft \
  --body "$body"
