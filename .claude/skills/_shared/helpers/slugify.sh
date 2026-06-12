#!/usr/bin/env bash
# slugify.sh — Convert a title into a kebab-case slug.
#
# Usage:
#   slugify.sh "Some Feature Title"
#
# Output:
#   some-feature-title
#
# Contract:
#   - Lowercase ASCII; transliterates accented characters when possible.
#   - Max 40 characters.
#   - No leading or trailing dashes.
#   - Consecutive non-alphanumeric runs collapse to a single dash.
#   - Exits non-zero on empty input or empty output.
#
# Note: iconv is invoked with `-c` so unmappable characters (em-dash,
# smart quotes, ellipsis, …) are dropped silently. Without `-c`, BSD
# iconv exits 1 on unmappable input and the previous `||` fallback
# duplicated the slug. See spec 046.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -lt 1 ]] || [[ -z "${1//[[:space:]]/}" ]]; then
  echo "Usage: $0 <title>" >&2
  exit 1
fi

input="$1"

ascii=$(echo "$input" | iconv -c -f UTF-8 -t ASCII//TRANSLIT 2>/dev/null || true)
if [[ -z "$ascii" ]]; then
  ascii="$input"
fi

slug=$(echo "$ascii" \
  | tr '[:upper:]' '[:lower:]' \
  | sed -E 's/[^a-z0-9]+/-/g' \
  | sed -E 's/^-+|-+$//g' \
  | cut -c1-40 \
  | sed -E 's/-+$//')

if [[ -z "$slug" ]]; then
  echo "Error: title produced empty slug" >&2
  exit 1
fi

echo "$slug"
