#!/usr/bin/env bash
# parse-spec-files.sh — Emit the §5 Files paths from a spec, glob-expanded.
#
# Usage:
#   parse-spec-files.sh <spec-path>
#
# Output:
#   One repo-relative POSIX path per line, sorted, deduplicated. Globs
#   that match nothing are emitted literally so the spec author sees
#   what they wrote.
#
# Spec 049 §4.3.

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <spec-path>" >&2
  exit 1
fi

spec="$1"

if [[ ! -f "$spec" ]]; then
  echo "Error: spec file not found: $spec" >&2
  exit 1
fi

root=$(git rev-parse --show-toplevel)
cd "$root"

# Section 5 is a markdown table. Each row starts with `| ` and the
# first column is the path, wrapped in backticks. We extract the first
# backticked token on rows that begin with `| \``; this skips header,
# separator, and notes-column inline code.
awk '/^## 5\. Files/,/^## 6\./' "$spec" \
  | grep -E '^\| `' \
  | sed -E 's/^\| `([^`]+)`.*/\1/' \
  | while IFS= read -r p; do
      # Trim whitespace.
      p="${p#"${p%%[![:space:]]*}"}"
      p="${p%"${p##*[![:space:]]}"}"
      [[ -z "$p" ]] && continue
      # Drop leading ./ for normalization.
      p="${p#./}"
      # Glob expansion against the working tree; literal paths fall
      # through unchanged.
      shopt -s nullglob
      matches=( $p )
      shopt -u nullglob
      if [[ ${#matches[@]} -gt 0 ]]; then
        printf '%s\n' "${matches[@]}"
      else
        printf '%s\n' "$p"
      fi
    done \
  | sort -u
