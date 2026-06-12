#!/usr/bin/env bash
# stuck.sh — Stuck-state detector over a list of failure signatures.
#
# Usage:
#   stuck.sh [--window N] <sig1> [<sig2> ...]
#
# Exit:
#   0 — stuck (last <window> signatures are identical and non-empty).
#   1 — not stuck.
#
# Default window: 2 (per spec 048 §4.5).

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

window=2
while [[ $# -gt 0 ]]; do
  case "$1" in
    --window)
      window="$2"
      shift 2
      ;;
    --)
      shift
      break
      ;;
    -*)
      echo "Usage: $0 [--window N] <sig1> [<sig2> ...]" >&2
      exit 2
      ;;
    *)
      break
      ;;
  esac
done

if ! [[ "$window" =~ ^[0-9]+$ ]] || [[ "$window" -lt 2 ]]; then
  echo "Error: --window must be an integer >= 2 (got: $window)" >&2
  exit 2
fi

if [[ $# -lt "$window" ]]; then
  exit 1
fi

# Take the last <window> args.
last=("${@: -$window}")
first="${last[0]}"

if [[ -z "$first" ]]; then
  exit 1
fi

for sig in "${last[@]}"; do
  if [[ "$sig" != "$first" ]]; then
    exit 1
  fi
done

exit 0
