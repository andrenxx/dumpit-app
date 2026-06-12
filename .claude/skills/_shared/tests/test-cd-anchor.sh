#!/usr/bin/env bash
# test-cd-anchor.sh — Regression harness for spec 104.
#
# Verifies that skill helpers anchor on repo root regardless of the
# caller's cwd. Two oracles:
#
#   1. Every .claude/skills/**/*.sh helper carries the cd anchor line
#      exactly once.
#   2. A representative subset of read-only helpers produces identical
#      output when invoked from repo root, apps/web/, and apps/worker/.
#
# Run manually:  bash .claude/skills/_shared/tests/test-cd-anchor.sh
#
# Exit 0 on full pass; non-zero with a diagnostic line on first failure.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

repo_root=$(git rev-parse --show-toplevel)
anchor_line='cd "$(git rev-parse --show-toplevel)"'

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
# Oracle 1: every helper carries the anchor line exactly once.
# ----------------------------------------------------------------------

while IFS= read -r f; do
  # Match the anchor only when it is a top-level statement, not when
  # it appears as a string literal (e.g. inside this test).
  count=$(grep -cE '^cd "\$\(git rev-parse --show-toplevel\)"$' "$f" || true)
  if [[ "$count" -ne 1 ]]; then
    fail "expected exactly 1 anchor statement in $f, found $count"
  fi
done < <(find .claude/skills -type f -name "*.sh")

ok "every .claude/skills/**/*.sh contains the cd anchor exactly once"

# ----------------------------------------------------------------------
# Oracle 2: read-only helpers produce identical output from any cwd.
#
# Picks helpers that are pure or read-only (no network, no writes):
#   - slugify.sh      (pure, takes string arg)
#   - next-spec-num.sh (reads docs/specs/)
#   - next-adr-num.sh (reads docs/architecture/decisions/)
# ----------------------------------------------------------------------

run_from() {
  local cwd="$1"
  shift
  ( cd "$cwd" && "$@" )
}

cwds=("$repo_root")
[[ -d "$repo_root/apps/web" ]] && cwds+=("$repo_root/apps/web")
[[ -d "$repo_root/apps/worker" ]] && cwds+=("$repo_root/apps/worker")

if [[ ${#cwds[@]} -lt 2 ]]; then
  fail "need at least one apps/<name>/ directory to test from a subdir"
fi

# Helper 1: slugify
slug_args=("Skills work from any monorepo subdirectory")
expected_slug=$(run_from "$repo_root" \
  "$repo_root/.claude/skills/_shared/helpers/slugify.sh" "${slug_args[@]}")
for cwd in "${cwds[@]}"; do
  got=$(run_from "$cwd" \
    "$repo_root/.claude/skills/_shared/helpers/slugify.sh" "${slug_args[@]}")
  if [[ "$got" != "$expected_slug" ]]; then
    fail "slugify.sh output differs when run from $cwd (got '$got', expected '$expected_slug')"
  fi
done
ok "slugify.sh: identical output from ${#cwds[@]} cwds"

# Helper 2: next-spec-num
expected_nnn=$(run_from "$repo_root" \
  "$repo_root/.claude/skills/_shared/helpers/next-spec-num.sh" 999)
for cwd in "${cwds[@]}"; do
  got=$(run_from "$cwd" \
    "$repo_root/.claude/skills/_shared/helpers/next-spec-num.sh" 999)
  if [[ "$got" != "$expected_nnn" ]]; then
    fail "next-spec-num.sh output differs when run from $cwd (got '$got', expected '$expected_nnn')"
  fi
done
ok "next-spec-num.sh: identical output from ${#cwds[@]} cwds"

# Helper 3: next-adr-num
expected_adr=$(run_from "$repo_root" \
  "$repo_root/.claude/skills/adr/helpers/next-adr-num.sh")
for cwd in "${cwds[@]}"; do
  got=$(run_from "$cwd" \
    "$repo_root/.claude/skills/adr/helpers/next-adr-num.sh")
  if [[ "$got" != "$expected_adr" ]]; then
    fail "next-adr-num.sh output differs when run from $cwd (got '$got', expected '$expected_adr')"
  fi
done
ok "next-adr-num.sh: identical output from ${#cwds[@]} cwds"

# ----------------------------------------------------------------------
# Done.
# ----------------------------------------------------------------------

echo "all $pass checks passed"
