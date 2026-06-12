#!/usr/bin/env bash
# repo-info.sh — Print the GitHub repository's OWNER/REPO.
#
# Usage:
#   repo-info.sh
#
# Output:
#   owner/repo (e.g., aurora-crista/pregacao-dev)
#
# Contract:
#   - Reads from `gh repo view`, so it follows the same auth and remote
#     resolution as every other gh call in the skills.
#   - Exits non-zero if gh is missing or not authenticated, or if the
#     current directory is not inside a git repository with a recognized
#     remote.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if ! command -v gh >/dev/null 2>&1; then
  echo "Error: gh CLI is required" >&2
  exit 1
fi

gh repo view --json nameWithOwner --jq .nameWithOwner
