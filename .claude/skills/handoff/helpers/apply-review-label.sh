#!/usr/bin/env bash
# apply-review-label.sh — Apply human-review-required to an issue.
#
# Usage:
#   apply-review-label.sh <issue-number>
#
# Behavior:
#   - Adds the `human-review-required` label to the issue (idempotent).
#   - Hard error if the label does not exist in the repo (rollout
#     instruction is to run setup-labels.sh once).
#
# Spec 048 §4.4.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <issue-number>" >&2
  exit 2
fi

issue="$1"

if ! [[ "$issue" =~ ^[0-9]+$ ]] || [[ "$issue" -lt 1 ]]; then
  echo "Error: issue-number must be a positive integer (got: $issue)" >&2
  exit 2
fi

if ! gh label list --limit 200 --json name --jq '.[].name' | grep -qx 'human-review-required'; then
  echo "Error: label 'human-review-required' does not exist." >&2
  echo "Run .claude/skills/handoff/helpers/setup-labels.sh once on this repo." >&2
  exit 1
fi

gh issue edit "$issue" --add-label "human-review-required" >/dev/null
