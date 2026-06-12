#!/usr/bin/env bash
# cleanup-worktree.sh — Post-ship cleanup of worktree, local branch, and
# main checkout state.
#
# Usage:
#   cleanup-worktree.sh <worktree-path> <branch-name> <main-repo-path>
#
# Behavior:
#   Worktree case ($wt != $main_repo):
#     - Removes the worktree directory (if registered) and the local branch
#       (if present). Both ops are idempotent.
#   Main-checkout case ($wt == $main_repo):
#     - Skips worktree removal (cannot remove the active checkout).
#     - Switches to `main`, deletes the local feature branch, and
#       fast-forwards `main` to origin so the next session starts clean.
#     - Refuses to delete `main` itself (safety case if invoked with
#       branch == main).
#   Prints a one-line summary on stdout describing what happened.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -ne 3 ]]; then
  echo "Usage: $0 <worktree-path> <branch-name> <main-repo-path>" >&2
  exit 1
fi

wt="$1"
branch="$2"
main_repo="$3"

if [[ -z "$wt" || -z "$branch" || -z "$main_repo" ]]; then
  echo "Error: all three arguments must be non-empty" >&2
  exit 1
fi

# Normalize paths for comparison.
wt_abs=$(cd "$wt" 2>/dev/null && pwd || echo "$wt")
main_abs=$(cd "$main_repo" 2>/dev/null && pwd || echo "$main_repo")

if [[ "$wt_abs" == "$main_abs" ]]; then
  # Main-checkout case: skip worktree removal, but still clean the branch
  # and fast-forward main.
  echo "Skipping worktree removal: $wt_abs is the main checkout"

  removed_branch=0
  if [[ "$branch" == "main" ]]; then
    echo "Skipping branch deletion: branch is main"
  else
    # The feature branch is currently checked out at the main checkout,
    # so switch to main first before deleting it.
    git -C "$main_repo" switch main >/dev/null 2>&1
    if git -C "$main_repo" show-ref --verify --quiet "refs/heads/$branch"; then
      git -C "$main_repo" branch -D "$branch" >/dev/null
      removed_branch=1
    fi
  fi

  # Fast-forward main to origin so the next session starts up to date.
  ff_status="ok"
  if ! git -C "$main_repo" pull --ff-only origin main >/dev/null 2>&1; then
    ff_status="failed"
  fi

  if [[ $removed_branch -eq 1 && "$ff_status" == "ok" ]]; then
    echo "Cleanup: stayed on main checkout, deleted local branch $branch, fast-forwarded main."
  elif [[ $removed_branch -eq 1 ]]; then
    echo "Cleanup: stayed on main checkout, deleted local branch $branch (pull --ff-only failed; main may be behind origin)."
  elif [[ "$ff_status" == "ok" ]]; then
    echo "Cleanup: stayed on main checkout, branch $branch was already gone, fast-forwarded main."
  else
    echo "Cleanup: stayed on main checkout, branch $branch was already gone (pull --ff-only failed; main may be behind origin)."
  fi
  exit 0
fi

# Worktree case ($wt != $main_repo): preserve original behavior.
removed_wt=0
removed_branch=0

# Worktree removal — only if the path is registered as a worktree.
if git -C "$main_repo" worktree list --porcelain | grep -qE "^worktree $wt_abs\$"; then
  git -C "$main_repo" worktree remove "$wt_abs"
  removed_wt=1
fi

# Local branch removal — only if it still exists.
if git -C "$main_repo" show-ref --verify --quiet "refs/heads/$branch"; then
  git -C "$main_repo" branch -D "$branch" >/dev/null
  removed_branch=1
fi

if [[ $removed_wt -eq 1 && $removed_branch -eq 1 ]]; then
  echo "Cleanup: removed worktree $wt_abs and local branch $branch."
elif [[ $removed_wt -eq 1 ]]; then
  echo "Cleanup: removed worktree $wt_abs (local branch $branch was already gone)."
elif [[ $removed_branch -eq 1 ]]; then
  echo "Cleanup: removed local branch $branch (worktree $wt_abs was already gone)."
else
  echo "Cleanup: nothing to do (worktree $wt_abs and branch $branch both already gone)."
fi
