#!/usr/bin/env bash
# test-workflow-guard.sh — Manual test harness for workflow-guard.sh and
# bash-workflow-guard.sh.
#
# Spawns a temporary git repo, drives each scenario, and asserts the
# hook's exit code + stderr substring. Run before merging spec 112.
#
# Usage:
#   bash .claude/hooks/test-workflow-guard.sh

set -euo pipefail

repo_root=$(git rev-parse --show-toplevel)
edit_hook="$repo_root/.claude/hooks/workflow-guard.sh"
bash_hook="$repo_root/.claude/hooks/bash-workflow-guard.sh"
parser_src="$repo_root/.claude/hooks/bash-write-targets.py"

[[ -x "$edit_hook" ]] || { echo "missing/non-executable: $edit_hook" >&2; exit 1; }
[[ -x "$bash_hook" ]] || { echo "missing/non-executable: $bash_hook" >&2; exit 1; }

tmp=$(mktemp -d -t workflow-guard-test)
trap 'rm -rf "$tmp"' EXIT

# Stand up a fixture repo with the hooks copied in.
git init -q -b main "$tmp"
mkdir -p "$tmp/.claude/hooks"
cp "$edit_hook" "$tmp/.claude/hooks/workflow-guard.sh"
cp "$bash_hook" "$tmp/.claude/hooks/bash-workflow-guard.sh"
cp "$parser_src" "$tmp/.claude/hooks/bash-write-targets.py"
chmod +x "$tmp/.claude/hooks/"*.sh
git -C "$tmp" -c user.email=t@t -c user.name=t commit --allow-empty -q -m init

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
    results+=("FAIL: $name — exit $got, want $expect_code")
    return
  fi
  if [[ -n "$expect_stderr" && "$err" != *"$expect_stderr"* ]]; then
    fail=$((fail+1))
    results+=("FAIL: $name — stderr missing '$expect_stderr'")
    return
  fi
  pass=$((pass+1))
  results+=("PASS: $name")
}

set_branch() {
  local name=$1
  git -C "$tmp" checkout -q -B "$name"
}

# --- Edit hook scenarios ---

set_branch main
run_case "edit on main blocks" "$edit_hook" \
  '{"tool_name":"Write","tool_input":{"file_path":"foo.ts"}}' \
  2 "/spec"

set_branch chore/112-ai-agents-ignoram-o-fluxo-spec-driven-ao
run_case "edit on chore/112-... allows" "$edit_hook" \
  '{"tool_name":"Write","tool_input":{"file_path":"foo.ts"}}' \
  0 ""

set_branch feat/112-foo
run_case "edit on feat/<N>-<slug> allows" "$edit_hook" \
  '{"tool_name":"Write","tool_input":{"file_path":"foo.ts"}}' \
  0 ""

set_branch random-branch
run_case "edit on bad branch blocks" "$edit_hook" \
  '{"tool_name":"Write","tool_input":{"file_path":"foo.ts"}}' \
  2 "spec-driven naming convention"

set_branch main
CLAUDE_CODE_DISABLE_WORKFLOW_GATE=1 \
  run_case "edit on main with env escape allows" "$edit_hook" \
    '{"tool_name":"Write","tool_input":{"file_path":"foo.ts"}}' \
    0 ""
unset CLAUDE_CODE_DISABLE_WORKFLOW_GATE 2>/dev/null || true

set_branch main
touch "$tmp/.claude/.implement-lock"
run_case "edit on main with implement-lock yields" "$edit_hook" \
  '{"tool_name":"Write","tool_input":{"file_path":"foo.ts"}}' \
  0 ""
rm -f "$tmp/.claude/.implement-lock"

# --- Bash hook scenarios ---

set_branch main
run_case "bash mutating on main blocks" "$bash_hook" \
  '{"tool_name":"Bash","tool_input":{"command":"echo hi > out.txt"}}' \
  2 "/spec"

set_branch main
run_case "bash read-only on main allows" "$bash_hook" \
  '{"tool_name":"Bash","tool_input":{"command":"ls -la"}}' \
  0 ""

set_branch chore/112-foo
run_case "bash mutating on chore/<N>-<slug> allows" "$bash_hook" \
  '{"tool_name":"Bash","tool_input":{"command":"echo hi > out.txt"}}' \
  0 ""

set_branch random-branch
run_case "bash mutating on bad branch blocks" "$bash_hook" \
  '{"tool_name":"Bash","tool_input":{"command":"echo hi > out.txt"}}' \
  2 "spec-driven naming convention"

set_branch main
CLAUDE_CODE_DISABLE_WORKFLOW_GATE=1 \
  run_case "bash mutating on main with env escape allows" "$bash_hook" \
    '{"tool_name":"Bash","tool_input":{"command":"echo hi > out.txt"}}' \
    0 ""
unset CLAUDE_CODE_DISABLE_WORKFLOW_GATE 2>/dev/null || true

set_branch main
touch "$tmp/.claude/.implement-lock"
run_case "bash mutating on main with implement-lock yields" "$bash_hook" \
  '{"tool_name":"Bash","tool_input":{"command":"echo hi > out.txt"}}' \
  0 ""
rm -f "$tmp/.claude/.implement-lock"

# --- Report ---
printf '%s\n' "${results[@]}"
echo
echo "passed: $pass / $((pass+fail))"
[[ "$fail" -eq 0 ]]
