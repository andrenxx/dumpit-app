#!/usr/bin/env bash
# setup-labels.sh — One-shot creation of labels owned by /handoff-related skills.
#
# Usage:
#   setup-labels.sh
#
# Behavior:
#   - Creates `human-review-required` (red, hard-stop signal).
#   - Idempotent: re-running on a labeled repo exits 0 with no change.
#
# Spec 048 §4.4. Run once per repo / fork.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

ensure_label() {
  local name="$1"
  local color="$2"
  local desc="$3"
  if gh label list --limit 200 --json name --jq '.[].name' | grep -qx "$name"; then
    printf 'Label exists: %s\n' "$name"
    return
  fi
  gh label create "$name" --color "$color" --description "$desc" >/dev/null
  printf 'Label created: %s\n' "$name"
}

ensure_label "human-review-required" "D93F0B" "Loop hit a hard-stop; needs human triage."
