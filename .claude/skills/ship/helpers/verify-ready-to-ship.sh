#!/usr/bin/env bash
# verify-ready-to-ship.sh — Refuse to ship without both PR-gate labels.
#
# Usage:
#   verify-ready-to-ship.sh <pr-number>
#
# Exit:
#   0 — PR has both spec:approved and code:approved.
#   1 — exactly one label is missing (the missing one is named on stderr).
#   2 — both labels are missing.

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

missing=0
if [[ "$labels" != *"spec:approved"* ]]; then
  echo "Missing label: spec:approved — run /spec-review first." >&2
  missing=$((missing + 1))
fi
if [[ "$labels" != *"code:approved"* ]]; then
  echo "Missing label: code:approved — run /code-review first." >&2
  missing=$((missing + 1))
fi

if [[ $missing -gt 0 ]]; then
  exit $missing
fi
