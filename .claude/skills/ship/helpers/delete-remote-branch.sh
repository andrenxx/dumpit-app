#!/usr/bin/env bash
# delete-remote-branch.sh — Delete a branch from the origin remote.
#
# Usage:
#   delete-remote-branch.sh <branch-name>
#
# Behavior:
#   - Resolves the origin repo via `gh repo view --json nameWithOwner`.
#   - Deletes the ref via `gh api -X DELETE
#     repos/<owner>/<repo>/git/refs/heads/<branch>`.
#   - Idempotent: a "Reference does not exist" / "Not Found" response is
#     treated as success with a one-line note on stdout, not an error.
#   - Any other failure surfaces the gh error verbatim and exits non-zero.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

branch="${1:?Usage: delete-remote-branch.sh <branch-name>}"

repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner)

if err=$(gh api -X DELETE "repos/$repo/git/refs/heads/$branch" 2>&1); then
  echo "Remote branch deleted: $branch"
else
  if echo "$err" | grep -qiE 'Reference does not exist|Not Found'; then
    echo "Remote branch already gone: $branch"
  else
    echo "$err" >&2
    exit 1
  fi
fi
