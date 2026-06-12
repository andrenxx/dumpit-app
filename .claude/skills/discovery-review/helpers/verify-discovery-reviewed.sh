#!/usr/bin/env bash
# verify-discovery-reviewed.sh — Gate helper used by /spec.
#
# Usage:
#   verify-discovery-reviewed.sh <issue-number>
#
# Behavior:
#   - Exits 0 when the issue carries phase:discovery-reviewed.
#   - Exits non-zero with a message pointing the user at /discovery-review
#     when the label is absent.
#   - There is no override flag — every discovery, including legacy ones,
#     must be audited before /spec will promote it.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <issue-number>" >&2
  exit 1
fi

n="$1"

if ! [[ "$n" =~ ^[0-9]+$ ]] || [[ "$n" -lt 1 ]]; then
  echo "Error: issue number must be a positive integer (got: $n)" >&2
  exit 1
fi

labels=$(gh issue view "$n" --json labels --jq '[.labels[].name] | join(",")')

if [[ "$labels" == *"phase:discovery-reviewed"* ]]; then
  exit 0
fi

cat >&2 <<EOF
Error: issue #$n is missing the phase:discovery-reviewed label.

       Run /discovery-review $n to audit the discovery against the
       project checklist (framing, UX-scope, vision, personas,
       pricing, competitors). Promotion via /spec is gated on the
       label; there is no override.

       Current labels: $labels
EOF
exit 1
