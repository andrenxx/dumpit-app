#!/usr/bin/env bash
# test-implement-guard-globs.sh — Manual test harness for the glob-aware
# allowlist matching in implement-guard.sh and bash-write-guard.sh.
#
# Spawns a temporary git repo, writes a controlled .implement-lock with
# both literal and glob patterns, drives each guard with crafted hook
# payloads, and asserts exit code + stderr substring per scenario.
#
# Usage:
#   bash .claude/hooks/test-implement-guard-globs.sh
#
# Spec 131 §2.5.

set -euo pipefail

repo_root=$(git rev-parse --show-toplevel)
edit_guard="$repo_root/.claude/hooks/implement-guard.sh"
bash_guard="$repo_root/.claude/hooks/bash-write-guard.sh"
matcher="$repo_root/.claude/hooks/match-allowlist.py"
parser="$repo_root/.claude/hooks/bash-write-targets.py"

for f in "$edit_guard" "$bash_guard" "$matcher" "$parser"; do
  [[ -e "$f" ]] || { echo "missing: $f" >&2; exit 1; }
done

tmp=$(mktemp -d -t implement-guard-globs)
trap 'rm -rf "$tmp"' EXIT

git init -q -b main "$tmp"
mkdir -p "$tmp/.claude/hooks"
cp "$edit_guard" "$tmp/.claude/hooks/implement-guard.sh"
cp "$bash_guard" "$tmp/.claude/hooks/bash-write-guard.sh"
cp "$matcher"    "$tmp/.claude/hooks/match-allowlist.py"
cp "$parser"     "$tmp/.claude/hooks/bash-write-targets.py"
chmod +x "$tmp/.claude/hooks/"*.sh "$tmp/.claude/hooks/"*.py
git -C "$tmp" -c user.email=t@t -c user.name=t commit --allow-empty -q -m init

write_lock() {
  # write_lock <json-array-of-files>
  python3 - "$tmp/.claude/.implement-lock" "$1" <<'PY'
import json, sys
lock, files_json = sys.argv[1], sys.argv[2]
data = {
    "spec_path": "docs/specs/000-fixture.md",
    "files": json.loads(files_json),
    "acquired_at": "2026-01-01T00:00:00Z",
}
with open(lock, "w") as f:
    json.dump(data, f)
PY
}

pass=0
fail=0
results=()

run_case() {
  local name=$1 hook=$2 payload=$3 expect_code=$4 expect_stderr=$5
  local stderr_file
  stderr_file=$(mktemp)
  set +e
  ( cd "$tmp" && printf '%s' "$payload" | bash "$hook" ) 2>"$stderr_file"
  local got=$?
  set -e
  local err
  err=$(cat "$stderr_file")
  rm -f "$stderr_file"
  if [[ "$got" -ne "$expect_code" ]]; then
    fail=$((fail+1))
    results+=("FAIL: $name — exit $got, want $expect_code; stderr: $err")
    return
  fi
  if [[ -n "$expect_stderr" && "$err" != *"$expect_stderr"* ]]; then
    fail=$((fail+1))
    results+=("FAIL: $name — stderr missing '$expect_stderr'; got: $err")
    return
  fi
  pass=$((pass+1))
  results+=("PASS: $name")
}

# --- Scenario 1: literal path in lock ---
write_lock '["src/a.ts"]'
run_case "literal: matching Edit allowed" "$edit_guard" \
  '{"tool_name":"Edit","tool_input":{"file_path":"src/a.ts"}}' \
  0 ""
run_case "literal: non-matching Edit blocked" "$edit_guard" \
  '{"tool_name":"Edit","tool_input":{"file_path":"src/b.ts"}}' \
  2 "not in the current spec"

# --- Scenario 2: glob pattern, no matching files at acquisition ---
write_lock '["apps/x/y/*.test.ts"]'
run_case "glob: Write to a.test.ts allowed" "$edit_guard" \
  '{"tool_name":"Write","tool_input":{"file_path":"apps/x/y/a.test.ts"}}' \
  0 ""
run_case "glob: Write to b.test.ts allowed" "$edit_guard" \
  '{"tool_name":"Write","tool_input":{"file_path":"apps/x/y/b.test.ts"}}' \
  0 ""
run_case "glob: Write to notes.md blocked" "$edit_guard" \
  '{"tool_name":"Write","tool_input":{"file_path":"apps/x/y/notes.md"}}' \
  2 "not in the current spec"

# --- Scenario 3: bash-write-guard sees the same glob ---
run_case "glob (bash): cat > a.test.ts allowed" "$bash_guard" \
  '{"tool_name":"Bash","tool_input":{"command":"echo hi > apps/x/y/a.test.ts"}}' \
  0 ""
run_case "glob (bash): tee notes.md blocked" "$bash_guard" \
  '{"tool_name":"Bash","tool_input":{"command":"echo hi | tee apps/x/y/notes.md"}}' \
  2 "not in the current spec"

# --- Scenario 4: ** recursive glob ---
write_lock '["apps/**/*.test.ts"]'
run_case "**: deep path matches" "$edit_guard" \
  '{"tool_name":"Write","tool_input":{"file_path":"apps/x/y/z/a.test.ts"}}' \
  0 ""
run_case "**: non-test path blocked" "$edit_guard" \
  '{"tool_name":"Write","tool_input":{"file_path":"apps/x/y/z/notes.md"}}' \
  2 "not in the current spec"

# --- Scenario 5: spec-edit short-circuit still fires ---
write_lock '["docs/specs/*.md"]'
run_case "spec-edit blocked even when glob would match" "$edit_guard" \
  '{"tool_name":"Edit","tool_input":{"file_path":"docs/specs/000-fixture.md"}}' \
  2 "spec edits are not allowed"
run_case "spec-edit blocked via bash too" "$bash_guard" \
  '{"tool_name":"Bash","tool_input":{"command":"echo hi > docs/specs/000-fixture.md"}}' \
  2 "spec edits are not allowed"

# --- Report ---
printf '%s\n' "${results[@]}"
echo
echo "passed: $pass / $((pass+fail))"
[[ "$fail" -eq 0 ]]
