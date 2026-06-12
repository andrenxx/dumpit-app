#!/usr/bin/env bash
# new-feature-branch.sh — Create a <type>/N-slug branch from origin/main.
#
# Usage:
#   new-feature-branch.sh <issue-number> <slug> <branch-type>
#   new-feature-branch.sh <issue-number> <slug>                # deprecated, defaults to feat
#
# Arguments:
#   <branch-type> — one of: feat, fix, chore. Resolved by SKILL.md
#                   from the issue's type:* label or the --branch-type
#                   override flag (see spec 014).
#
# Output:
#   Branch name on stdout (e.g., feat/9-planning-skills, chore/14-extend-spec).
#
# Guards:
#   - Refuses if working tree has uncommitted changes.
#   - Refuses if a local branch with the target name already exists.
#   - Fetches origin/main before branching.
#   - Refuses any <branch-type> other than feat|fix|chore.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -lt 2 || $# -gt 3 ]]; then
  echo "Usage: $0 <issue-number> <slug> <branch-type>" >&2
  exit 1
fi

n="$1"
slug="$2"

if [[ $# -eq 3 ]]; then
  type="$3"
else
  echo "warn: new-feature-branch.sh called without <branch-type>; defaulting to 'feat'. Pass an explicit type (feat|fix|chore) — two-arg form is deprecated." >&2
  type="feat"
fi

if ! [[ "$n" =~ ^[0-9]+$ ]] || [[ "$n" -lt 1 ]]; then
  echo "Error: issue number must be a positive integer (got: $n)" >&2
  exit 1
fi

if [[ -z "$slug" ]]; then
  echo "Error: slug must not be empty" >&2
  exit 1
fi

if ! [[ "$type" =~ ^(feat|fix|chore)$ ]]; then
  echo "Error: branch-type must be one of: feat, fix, chore (got: $type)" >&2
  exit 2
fi

branch="$type/$n-$slug"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: working tree is not clean — commit or stash before creating a feature branch" >&2
  exit 1
fi

if git show-ref --verify --quiet "refs/heads/$branch"; then
  echo "Error: branch already exists locally: $branch" >&2
  exit 1
fi

git fetch origin main --quiet
git switch -c "$branch" origin/main >&2

echo "$branch"
