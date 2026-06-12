#!/usr/bin/env bash
# invalidate-spec-approval.sh — Remove spec:approved when the spec changes substantively.
#
# Usage:
#   invalidate-spec-approval.sh <pr-number> <spec-path>
#
# Behavior:
#   - Compares the spec file's content lines (whitespace-insensitive)
#     between origin/main and HEAD on the current branch.
#   - If non-zero substantive diff, removes the spec:approved label from
#     the PR (no-op if the label is absent) and posts a one-line comment
#     explaining why.
#   - If diff is whitespace-only, exits 0 silently (no invalidation).
#
# Notes:
#   - This helper is invoked by Phase 1.2's /code-review when a code commit
#     touches the spec file. Defined here because the spec layer owns the
#     contract for what counts as a substantive change.
#   - A spec-only change between approval and re-review is the expected
#     case for invalidation.

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

git fetch origin main --quiet

# `git diff -w` ignores all whitespace differences. If the diff is empty
# under -w, the change is whitespace-only and we leave approval intact.
if git diff -w --quiet origin/main -- "$spec"; then
  exit 0
fi

# Substantive change. Remove label if present.
labels=$(gh pr view "$pr" --json labels --jq '[.labels[].name] | join(",")')
if [[ "$labels" == *"spec:approved"* ]]; then
  gh pr edit "$pr" --remove-label "spec:approved" >/dev/null
  gh pr comment "$pr" --body "⚠️ **spec:approved removed** — the spec was modified after approval. Run \`/spec-review\` again to re-confirm."$'\n\n_Posted by `invalidate-spec-approval.sh`._'
fi
