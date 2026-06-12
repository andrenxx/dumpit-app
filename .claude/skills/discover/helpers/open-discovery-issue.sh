#!/usr/bin/env bash
# open-discovery-issue.sh — Create a phase:discovery GitHub issue.
#
# Usage:
#   open-discovery-issue.sh <title> <body-file> <type-label>
#
# Output:
#   Issue URL on stdout.
#
# Contract:
#   - <type-label> must be one of: type:feature, type:chore, type:bug.
#   - <body-file> must exist and be readable.
#   - Exits non-zero on validation failure or if `gh issue create` fails.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -ne 3 ]]; then
  echo "Usage: $0 <title> <body-file> <type-label>" >&2
  exit 1
fi

title="$1"
body_file="$2"
type_label="$3"

if [[ ! -f "$body_file" ]]; then
  echo "Error: body file not found: $body_file" >&2
  exit 1
fi

case "$type_label" in
  type:feature|type:chore|type:bug) ;;
  *)
    echo "Error: type-label must be type:feature, type:chore, or type:bug (got: $type_label)" >&2
    exit 1
    ;;
esac

gh issue create \
  --title "$title" \
  --body-file "$body_file" \
  --label "phase:discovery,$type_label"
