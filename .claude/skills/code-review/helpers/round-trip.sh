#!/usr/bin/env bash
# round-trip.sh — Read, bump, or reset the round-trip counter for a PR.
#
# Usage:
#   round-trip.sh read   <pr-number>
#   round-trip.sh bump   <pr-number> <blocker-fingerprint>
#   round-trip.sh reset  <pr-number>
#
# Storage: a single PR label of the form `round-trip:N`.
#
# Bump idempotency: if the most recent round-trip bump comment carries
# the same blocker-fingerprint as the one passed here, the bump is a
# no-op. The fingerprint is recorded in a comment marker on the PR
# (`<!-- round-trip-fp: <fp> -->`).
#
# Spec 048 §4.3.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

usage() {
  echo "Usage:" >&2
  echo "  $0 read   <pr-number>" >&2
  echo "  $0 bump   <pr-number> <blocker-fingerprint>" >&2
  echo "  $0 reset  <pr-number>" >&2
  exit 2
}

if [[ $# -lt 2 ]]; then
  usage
fi

cmd="$1"
pr="$2"

if ! [[ "$pr" =~ ^[0-9]+$ ]] || [[ "$pr" -lt 1 ]]; then
  echo "Error: pr-number must be a positive integer (got: $pr)" >&2
  exit 2
fi

read_count() {
  local labels
  labels=$(gh pr view "$pr" --json labels --jq '.labels[].name')
  local n=0
  while IFS= read -r label; do
    if [[ "$label" =~ ^round-trip:([0-9]+)$ ]]; then
      n="${BASH_REMATCH[1]}"
      break
    fi
  done <<< "$labels"
  printf '%s' "$n"
}

remove_label() {
  local current="$1"
  if [[ "$current" -gt 0 ]]; then
    gh pr edit "$pr" --remove-label "round-trip:$current" >/dev/null 2>&1 || true
  fi
}

ensure_label_exists() {
  local name="$1"
  if ! gh label list --limit 200 --json name --jq '.[].name' | grep -qx "$name"; then
    gh label create "$name" --color "FBCA04" --description "Round-trip count between /implement and /code-review" >/dev/null
  fi
}

last_fingerprint() {
  gh pr view "$pr" --json comments --jq '.comments[].body' \
    | grep -oE '<!-- round-trip-fp: [a-f0-9]+ -->' \
    | tail -1 \
    | sed -E 's/^<!-- round-trip-fp: ([a-f0-9]+) -->$/\1/' \
    || true
}

case "$cmd" in
  read)
    [[ $# -eq 2 ]] || usage
    read_count
    echo
    ;;
  bump)
    [[ $# -eq 3 ]] || usage
    fp="$3"
    if [[ -z "$fp" ]]; then
      echo "Error: blocker-fingerprint must not be empty" >&2
      exit 2
    fi
    last=$(last_fingerprint)
    if [[ "$last" == "$fp" ]]; then
      # Idempotent: same blockers as last bump; no-op.
      read_count
      echo
      exit 0
    fi
    current=$(read_count)
    next=$((current + 1))
    ensure_label_exists "round-trip:$next"
    remove_label "$current"
    gh pr edit "$pr" --add-label "round-trip:$next" >/dev/null
    gh pr comment "$pr" --body "<!-- round-trip-fp: $fp -->
🔁 round-trip $next" >/dev/null
    printf '%s\n' "$next"
    ;;
  reset)
    [[ $# -eq 2 ]] || usage
    current=$(read_count)
    remove_label "$current"
    printf '0\n'
    ;;
  *)
    usage
    ;;
esac
