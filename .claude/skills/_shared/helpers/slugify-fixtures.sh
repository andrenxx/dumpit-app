#!/usr/bin/env bash
# slugify-fixtures.sh — Fixture-driven smoke test for slugify.sh.
#
# Asserts the helper produces exactly one slug line on stdout for a
# small set of representative inputs (ASCII, em-dash, accented Latin,
# smart quotes / ellipsis, en-dash + em-dash combo) and that empty
# input still exits non-zero. Manual invocation; no test runner yet
# (see #36).
#
# Usage:
#   .claude/skills/_shared/helpers/slugify-fixtures.sh
#
# Exits 0 on all-pass, 1 on any FAIL.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
slugify="$here/slugify.sh"
fail=0

check() {
  local input="$1" expected="$2"
  local got
  got=$("$slugify" "$input")
  if [[ "$(printf '%s\n' "$got" | wc -l | tr -d ' ')" -ne 1 ]]; then
    echo "FAIL (multi-line): input='$input' got='$got'"
    fail=1
    return
  fi
  if [[ "$got" != "$expected" ]]; then
    echo "FAIL: input='$input' got='$got' expected='$expected'"
    fail=1
    return
  fi
  echo "OK: $expected"
}

check_empty() {
  local input="$1"
  if "$slugify" "$input" >/dev/null 2>&1; then
    echo "FAIL (empty guard): input='$input' should have exited non-zero"
    fail=1
    return
  fi
  echo "OK: empty-input guard for '$input'"
}

check "Plain feature title" "plain-feature-title"
check "Operationalize ADR 0003 — close the autonomous-loop cycle" "operationalize-adr-0003-close-the-autono"
check "Suporte para títulos em português" "suporte-para-t-itulos-em-portugu-es"
check "Title with \"smart quotes\" and an ellipsis…" "title-with-smart-quotes-and-an-ellipsis"
check "En–dash and em—dash together" "en-dash-and-em-dash-together"
check_empty "   "

exit "$fail"
