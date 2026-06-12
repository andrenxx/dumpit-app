#!/usr/bin/env bash
# verify-spec-approved.sh — Refuse to start /implement without spec:approved.
#
# Usage:
#   verify-spec-approved.sh <pr-number>
#
# Exit:
#   0 — PR carries spec:approved.
#   1 — label missing or PR not found.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <pr-number>" >&2
  exit 1
fi

pr="$1"

if ! [[ "$pr" =~ ^[0-9]+$ ]] || [[ "$pr" -lt 1 ]]; then
  echo "Error: pr-number must be a positive integer (got: $pr)" >&2
  exit 1
fi

labels=$(gh pr view "$pr" --json labels --jq '[.labels[].name] | join(",")')

if [[ "$labels" != *"spec:approved"* ]]; then
  echo "Error: PR #$pr does not carry spec:approved (current PR labels: ${labels:-<none>})" >&2
  echo "Run /spec-review first to apply the label." >&2
  exit 1
fi
