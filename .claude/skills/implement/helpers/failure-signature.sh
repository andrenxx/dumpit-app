#!/usr/bin/env bash
# failure-signature.sh — Compute a deterministic short digest of a gate failure.
#
# Usage:
#   failure-signature.sh <gate-name> < stderr
#
# Behavior:
#   - Reads the failed gate's stderr from stdin.
#   - Normalizes: strips ANSI escapes, project-root and tmp path prefixes,
#     line:column numbers, and trailing whitespace.
#   - Hashes "<gate-name>:<last-3-normalized-lines>" with sha1.
#   - Prints the first 12 hex characters.
#
# Same logical failure across machines yields the same digest. Used by
# /implement's stuck detector (spec 048 §4.1).

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <gate-name>" >&2
  exit 1
fi

gate="$1"

if [[ -z "$gate" ]]; then
  echo "Error: gate-name must not be empty" >&2
  exit 1
fi

root=$(git rev-parse --show-toplevel 2>/dev/null || echo "")

# Normalize stdin:
#   - strip ANSI escape sequences
#   - replace absolute project-root paths with "<root>"
#   - replace tmp dirs (/tmp/, /var/folders/) with "<tmp>"
#   - strip ":<line>:<col>" suffixes
#   - strip trailing whitespace
#   - keep the last 3 non-empty lines
normalized=$(
  ROOT="$root" perl -pe '
    s/\e\[[0-9;]*[a-zA-Z]//g;
    s{/(tmp|var/folders)/[^ :]*}{<tmp>}g;
    s/:\d+:\d+//g;
    s/\s+$//;
    if (length $ENV{ROOT}) { my $r = quotemeta $ENV{ROOT}; s/$r/<root>/g; }
  ' \
  | grep -v '^$' \
  | tail -n 3
)

digest=$(printf '%s:%s' "$gate" "$normalized" | shasum -a 1 | cut -c1-12)
printf '%s\n' "$digest"
