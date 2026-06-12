#!/usr/bin/env bash
# next-spec-num.sh — Format an issue number as the spec number.
#
# Usage:
#   next-spec-num.sh <issue-number>
#
# Output:
#   3-digit zero-padded number (e.g., 9 → 009, 42 → 042, 137 → 137).
#
# Contract:
#   - Per ADR-0001, the spec number equals the issue number.
#   - Always 3 digits even for issues ≥ 1000 (the format keeps growing).
#   - Exits non-zero on non-positive-integer input.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <issue-number>" >&2
  exit 1
fi

n="$1"

if ! [[ "$n" =~ ^[0-9]+$ ]] || [[ "$n" -lt 1 ]]; then
  echo "Error: issue number must be a positive integer (got: $n)" >&2
  exit 1
fi

printf '%03d\n' "$n"
