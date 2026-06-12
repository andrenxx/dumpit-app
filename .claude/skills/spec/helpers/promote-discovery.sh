#!/usr/bin/env bash
# promote-discovery.sh — Move an issue from phase:discovery to phase:spec.
#
# Usage:
#   promote-discovery.sh <issue-number>
#
# Contract:
#   - The issue must currently carry the phase:discovery label; otherwise
#     the helper exits non-zero and explains why.
#   - On success, the issue label set transitions discovery → spec.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <issue-number>" >&2
  exit 1
fi

n="$1"

if ! [[ "$n" =~ ^[0-9]+$ ]] || [[ "$n" -lt 1 ]]; then
  echo "Error: issue number must be a positive integer (got: $n)" >&2
  exit 1
fi

labels=$(gh issue view "$n" --json labels --jq '[.labels[].name] | join(",")')

if [[ "$labels" != *"phase:discovery"* ]]; then
  echo "Error: issue #$n does not have phase:discovery label (current: $labels)" >&2
  exit 1
fi

gh issue edit "$n" --remove-label "phase:discovery" --add-label "phase:spec" >/dev/null
echo "Issue #$n promoted: phase:discovery → phase:spec"
