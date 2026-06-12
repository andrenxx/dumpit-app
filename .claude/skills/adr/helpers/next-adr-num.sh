#!/usr/bin/env bash
# next-adr-num.sh — Resolve the next ADR number from the decisions directory.
#
# Usage:
#   next-adr-num.sh
#
# Output:
#   Next ADR number, zero-padded to 4 digits (e.g., 0001, 0042, 1024).
#
# Behavior:
#   - Resolves the repo root via `git rev-parse --show-toplevel`.
#   - Scans `<root>/docs/architecture/decisions/[0-9][0-9][0-9][0-9]-*.md`.
#   - Picks the highest existing NNNN; outputs NNNN+1.
#   - Returns 0001 when no ADRs exist (the directory may still contain
#     `_template.md`, which the glob ignores).
#   - Exits non-zero if the decisions directory is missing.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

repo_root=$(git rev-parse --show-toplevel)
dir="$repo_root/docs/architecture/decisions"

if [[ ! -d "$dir" ]]; then
  echo "Error: ADR directory not found at $dir" >&2
  exit 1
fi

# Find files matching NNNN-*.md. The glob fails-on-nomatch by default
# under set -e via shopt nullglob behavior; use a defensive find.
highest=$(find "$dir" -maxdepth 1 -type f -name '[0-9][0-9][0-9][0-9]-*.md' \
  -exec basename {} \; \
  | sed -E 's/^([0-9]{4})-.*/\1/' \
  | sort -n \
  | tail -1)

if [[ -z "$highest" ]]; then
  next=1
else
  # Strip leading zeros to avoid octal interpretation.
  highest_int=$((10#$highest))
  next=$((highest_int + 1))
fi

printf '%04d\n' "$next"
