#!/usr/bin/env bash
# current-pr.sh — Resolve the open PR number for the current branch.
#
# Usage:
#   current-pr.sh
#
# Output:
#   PR number (just the integer) on stdout.
#
# Contract:
#   - Exits non-zero if the current branch has no open PR.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if ! gh pr view --json number >/dev/null 2>&1; then
  echo "Error: no open PR for the current branch" >&2
  exit 1
fi

gh pr view --json number --jq .number
