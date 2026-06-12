#!/usr/bin/env bash
# check-bounds.sh — Read /implement bounds for a PR.
#
# Usage:
#   check-bounds.sh <pr-number>
#
# Behavior:
#   - Reads max_iterations and max_round_trips constants (spec 048 §4.5).
#   - Reads the current round-trip counter from the PR's `round-trip:N`
#     label (0 if absent).
#   - On stdout, prints three lines:
#       max_iterations=<N>
#       max_round_trips=<N>
#       round_trip=<N>
#   - Exits non-zero with a one-line reason on stderr when round_trip
#     already equals or exceeds max_round_trips (the loop should not
#     start; it should hard-stop).
#
# Spec 048 §4.3.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

# Constants per spec 048 §4.5.
MAX_ITERATIONS=5
MAX_ROUND_TRIPS=3

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <pr-number>" >&2
  exit 2
fi

pr="$1"

if ! [[ "$pr" =~ ^[0-9]+$ ]] || [[ "$pr" -lt 1 ]]; then
  echo "Error: pr-number must be a positive integer (got: $pr)" >&2
  exit 2
fi

labels=$(gh pr view "$pr" --json labels --jq '.labels[].name')

round_trip=0
while IFS= read -r label; do
  if [[ "$label" =~ ^round-trip:([0-9]+)$ ]]; then
    round_trip="${BASH_REMATCH[1]}"
    break
  fi
done <<< "$labels"

printf 'max_iterations=%s\n' "$MAX_ITERATIONS"
printf 'max_round_trips=%s\n' "$MAX_ROUND_TRIPS"
printf 'round_trip=%s\n' "$round_trip"

if [[ "$round_trip" -ge "$MAX_ROUND_TRIPS" ]]; then
  echo "Bound hit: round-trip $round_trip >= max $MAX_ROUND_TRIPS" >&2
  exit 1
fi
