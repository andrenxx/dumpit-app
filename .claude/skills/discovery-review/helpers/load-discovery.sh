#!/usr/bin/env bash
# load-discovery.sh — Resolve a phase:discovery issue and stage it for audit.
#
# Usage:
#   load-discovery.sh <issue-number>
#
# Output:
#   Path to a tmp file containing the issue title, label list, and body
#   in a stable format the audit subagent reads.
#
# Behavior:
#   - Refuses if the issue does not carry phase:discovery (or
#     phase:discovery-reviewed for re-runs).
#   - Refuses any non-positive integer.

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

payload=$(gh issue view "$n" --json title,body,labels)
labels=$(echo "$payload" | jq -r '[.labels[].name] | join(",")')

if [[ "$labels" != *"phase:discovery"* ]]; then
  echo "Error: issue #$n is not in phase:discovery (current labels: $labels)" >&2
  echo "       /discovery-review only audits discoveries." >&2
  exit 1
fi

tmp=$(mktemp -t discovery-review-XXXXXX)

{
  echo "# Issue #$n"
  echo
  echo "**Title:** $(echo "$payload" | jq -r .title)"
  echo
  echo "**Labels:** $labels"
  echo
  echo "## Body"
  echo
  echo "$payload" | jq -r .body
} > "$tmp"

echo "$tmp"
