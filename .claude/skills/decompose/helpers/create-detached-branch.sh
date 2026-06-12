#!/usr/bin/env bash
# create-detached-branch.sh — Push a new <type>/N-slug branch from origin/main without checking out.
#
# Usage:
#   create-detached-branch.sh <issue-number> <slug> <branch-type>
#
# Args:
#   <branch-type> ∈ {feat, fix, chore}. The caller (e.g. /decompose
#   SKILL.md step 4.c) is responsible for mapping the child issue's
#   `type:*` label per /spec § 2.1 and passing the result here. The
#   helper itself stays dumb: it validates the value and refuses
#   anything else.
#
# Output:
#   Branch name on stdout (e.g., chore/42-add-ogg-support).
#
# Behavior:
#   - Fetches origin/main.
#   - Creates the new branch locally pointing at origin/main, but does
#     NOT switch the current worktree's HEAD to it.
#   - Pushes the new branch to origin so the placeholder PR can target
#     it.
#   - Refuses if the local or remote branch already exists.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -ne 3 ]]; then
  echo "Usage: $0 <issue-number> <slug> <branch-type>" >&2
  exit 1
fi

n="$1"
slug="$2"
branch_type="$3"

if ! [[ "$n" =~ ^[0-9]+$ ]] || [[ "$n" -lt 1 ]]; then
  echo "Error: issue-number must be a positive integer (got: $n)" >&2
  exit 1
fi

if [[ -z "$slug" ]]; then
  echo "Error: slug must not be empty" >&2
  exit 1
fi

case "$branch_type" in
  feat|fix|chore) ;;
  *)
    echo "Error: branch-type must be one of {feat, fix, chore} (got: '$branch_type')" >&2
    exit 1
    ;;
esac

branch="$branch_type/$n-$slug"

git fetch origin main --quiet

if git show-ref --verify --quiet "refs/heads/$branch"; then
  echo "Error: local branch already exists: $branch" >&2
  exit 1
fi

if git show-ref --verify --quiet "refs/remotes/origin/$branch"; then
  echo "Error: remote branch already exists: origin/$branch" >&2
  exit 1
fi

# Create the branch ref locally (no checkout) and push to origin.
# Both commands are routed to stderr so the helper's stdout is just the
# branch name, capturable cleanly via $(...).
{
  git branch "$branch" origin/main
  git push -u origin "$branch"
} >&2

echo "$branch"
