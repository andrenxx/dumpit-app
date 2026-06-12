#!/usr/bin/env bash
# test-decompose-spec-helpers.sh — Regression harness for spec 075.
#
# Exercises the surviving bug oracles after spec 089 reframed
# decomposition as a /spec-review verdict:
#   1. rewrite-parent-spec.sh preserves section 2.5 verbatim.
#   2. create-detached-branch.sh validates its branch-type arg.
#
# (The third bug oracle, around fence handling in the deleted
# size-counter helper, is gone — the decomposition decision is now
# an LLM verdict, not a bash script.)
#
# Run manually:  bash .claude/skills/_shared/tests/test-decompose-spec-helpers.sh
#
# Exit 0 on full pass; non-zero with a diagnostic line on first failure.
# No framework dependency — plain bash + diff/grep/exit codes.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

repo_root=$(git rev-parse --show-toplevel)
fixtures="$repo_root/.claude/skills/_shared/tests/fixtures"
rewrite="$repo_root/.claude/skills/decompose/helpers/rewrite-parent-spec.sh"
detached="$repo_root/.claude/skills/decompose/helpers/create-detached-branch.sh"

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

pass=0
fail() {
  echo "✗ FAIL: $1" >&2
  exit 1
}
ok() {
  pass=$((pass + 1))
  echo "✓ $1"
}

# ----------------------------------------------------------------------
# Bug 1: rewrite-parent-spec.sh preserves section 2.5 verbatim.
# ----------------------------------------------------------------------

cp "$fixtures/parent-with-2-5.md" "$tmp/with.md"
"$rewrite" "$tmp/with.md" "$fixtures/children.json" >/dev/null
grep -q '^## 2\.5 Validation strategy (inherited from pre-decompose)$' "$tmp/with.md" \
  || fail "bug1a: inherited 2.5 heading missing from rewritten tracker"
for line in ORACLE_LINE_1 ORACLE_LINE_2 ORACLE_LINE_3; do
  grep -q "$line" "$tmp/with.md" || fail "bug1a: oracle line '$line' lost"
done
# Inherited block must sit before "## 3. Acceptance".
inherited_lineno=$(grep -n '^## 2\.5 Validation strategy (inherited' "$tmp/with.md" | cut -d: -f1)
acceptance_lineno=$(grep -n '^## 3\. Acceptance' "$tmp/with.md" | cut -d: -f1)
[[ -n "$inherited_lineno" && -n "$acceptance_lineno" && "$inherited_lineno" -lt "$acceptance_lineno" ]] \
  || fail "bug1a: inherited 2.5 not positioned before section 3"
ok "bug 1a: rewrite-parent-spec.sh preserves 2.5 verbatim, in correct position"

# Negative: source without 2.5 → no inherited block in output.
cp "$fixtures/parent-without-2-5.md" "$tmp/without.md"
"$rewrite" "$tmp/without.md" "$fixtures/children.json" >/dev/null
if grep -q '^## 2\.5' "$tmp/without.md"; then
  fail "bug1b: empty 2.5 source produced an inherited section anyway"
fi
ok "bug 1b: rewrite-parent-spec.sh emits no placeholder when source has no 2.5"

# ----------------------------------------------------------------------
# Bug 2: create-detached-branch.sh validates its branch-type arg.
# Only validation paths are exercised here; full git-side-effect runs
# require a real repo + remote and live in manual acceptance.
# ----------------------------------------------------------------------

if "$detached" 1 slug 2>/dev/null; then
  fail "bug2a: 2-arg invocation should exit non-zero"
fi
ok "bug 2a: 2-arg invocation rejected"

if "$detached" 1 slug feature 2>/dev/null; then
  fail "bug2b: invalid branch-type 'feature' should exit non-zero"
fi
ok "bug 2b: invalid branch-type rejected"

stderr=$("$detached" 1 slug feature 2>&1 >/dev/null || true)
echo "$stderr" | grep -q "branch-type must be one of {feat, fix, chore}" \
  || fail "bug2c: error message for invalid branch-type does not match spec wording"
ok "bug 2c: invalid branch-type error message matches spec"

echo
echo "All $pass checks passed."
