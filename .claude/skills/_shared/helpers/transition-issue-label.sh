#!/usr/bin/env bash
# transition-issue-label.sh — Move an issue between adjacent phase: labels.
#
# Usage:
#   transition-issue-label.sh <issue-number> <from-label> <to-label>
#
# Contract:
#   - <from-label> must currently be present on the issue.
#   - <to-label> must be exactly one step forward in the canonical sequence:
#       phase:discovery → phase:spec → phase:implementing → phase:review → phase:shipped
#   - Non-adjacent transitions are refused (no skipping). Backward
#     transitions are refused (no rewinding).
#   - On success: removes <from-label>, adds <to-label>, prints a one-line
#     confirmation.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -ne 3 ]]; then
  echo "Usage: $0 <issue-number> <from-label> <to-label>" >&2
  exit 1
fi

n="$1"
from="$2"
to="$3"

if ! [[ "$n" =~ ^[0-9]+$ ]] || [[ "$n" -lt 1 ]]; then
  echo "Error: issue number must be a positive integer (got: $n)" >&2
  exit 1
fi

# Canonical ordering. Index = position in the sequence.
sequence=("phase:discovery" "phase:spec" "phase:implementing" "phase:review" "phase:shipped")

position_of() {
  local target="$1"
  for i in "${!sequence[@]}"; do
    if [[ "${sequence[$i]}" == "$target" ]]; then
      echo "$i"
      return 0
    fi
  done
  echo "-1"
}

from_pos=$(position_of "$from")
to_pos=$(position_of "$to")

if [[ "$from_pos" -lt 0 ]]; then
  echo "Error: from-label '$from' is not in the canonical phase sequence" >&2
  exit 1
fi

if [[ "$to_pos" -lt 0 ]]; then
  echo "Error: to-label '$to' is not in the canonical phase sequence" >&2
  exit 1
fi

if [[ $((to_pos - from_pos)) -ne 1 ]]; then
  echo "Error: refused non-adjacent transition $from → $to" >&2
  echo "       canonical sequence: ${sequence[*]}" >&2
  exit 1
fi

current_labels=$(gh issue view "$n" --json labels --jq '[.labels[].name] | join(",")')

if [[ "$current_labels" != *"$from"* ]]; then
  echo "Error: issue #$n does not currently carry '$from' (has: $current_labels)" >&2
  exit 1
fi

gh issue edit "$n" --remove-label "$from" --add-label "$to" >/dev/null
echo "Issue #$n: $from → $to"
