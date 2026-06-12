#!/usr/bin/env bash
# run-sanity-gates.sh — Run the sanity gates appropriate for the staged diff.
#
# Usage:
#   run-sanity-gates.sh [--root <path>]
#
# Behavior (per specs 025 + 103):
#   1. Collect staged paths via `git diff --cached --name-only`.
#   2. Empty diff → exit 1 ("no staged changes; nothing to audit").
#   3. Pipe paths through classify-diff.sh; log the resulting buckets.
#   4. For each bucket `app:<name>` (sorted): cd into apps/<name> and
#      run whichever of {lint, type-check, build, test} are declared in
#      apps/<name>/package.json. If none are declared, hard-error.
#   5. For bucket `node` (root-level Node files, no app prefix): run
#      whichever of {lint, type-check, build, test} exist in
#      <root>/package.json. If `node` is present but none of the
#      recognized scripts exist (or no root package.json exists),
#      hard-error.
#   6. For bucket `shell`: run `bash -n <path>` against every staged
#      *.sh / *.bash. Any parse error → hard-fail with the path on stderr.
#   7. For bucket `docs` / `other`: log skipped, run nothing.
#   8. If no applicable gate ran (e.g., docs-only diff): emit
#      "no auditable changes; gates skipped" and exit 0.
#   9. Any gate failure → exit 1.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

root=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --root)
      root="$2"
      shift 2
      ;;
    *)
      echo "Usage: $0 [--root <path>]" >&2
      exit 1
      ;;
  esac
done

if [[ -z "$root" ]]; then
  root=$(git rev-parse --show-toplevel)
fi

cd "$root"

classifier="$root/.claude/skills/implement/helpers/classify-diff.sh"
if [[ ! -x "$classifier" ]]; then
  echo "Error: classifier not found or not executable at $classifier" >&2
  exit 1
fi

# 1. Collect staged paths.
staged_paths=$(git diff --cached --name-only)

# 2. Empty diff guard.
if [[ -z "$staged_paths" ]]; then
  echo "Error: no staged changes; nothing to audit." >&2
  exit 1
fi

# 3. Classify and log.
buckets=$(printf '%s\n' "$staged_paths" | "$classifier")
buckets_csv=$(printf '%s\n' "$buckets" | grep -v '^$' | paste -sd, -)
echo "▶ classify: ${buckets_csv:-<none>}"

has_bucket() {
  printf '%s\n' "$buckets" | grep -qx "$1"
}

ran_any=0
fail=0

# Canonical gate order. Matched against scripts in package.json.
gates=(lint type-check build test)

run_app_gates() {
  local app="$1"
  local app_dir="$root/apps/$app"
  local pkg="$app_dir/package.json"
  if [[ ! -f "$pkg" ]]; then
    echo "Error: apps/$app/package.json not found (app:$app classified)" >&2
    fail=1
    return
  fi
  local existing=()
  local g
  for g in "${gates[@]}"; do
    if grep -qE "\"$g\"\\s*:\\s*\"" "$pkg"; then
      existing+=("$g")
    fi
  done
  if [[ ${#existing[@]} -eq 0 ]]; then
    echo "Error: apps/$app/package.json declares none of the recognized sanity gates: ${gates[*]}" >&2
    echo "Add at least one (e.g., \"lint\": \"eslint .\") before running /implement." >&2
    fail=1
    return
  fi
  for g in "${existing[@]}"; do
    echo "▶ (apps/$app) npm run $g"
    if ! ( cd "$app_dir" && npm run "$g" ); then
      echo "✗ gate '$g' failed in apps/$app" >&2
      fail=1
    fi
    ran_any=1
  done
}

# 4. Per-app gates (sorted alphabetically by app name).
app_tags=$(printf '%s\n' "$buckets" | grep '^app:' | sort -u || true)
if [[ -n "$app_tags" ]]; then
  while IFS= read -r tag; do
    [[ -z "$tag" ]] && continue
    run_app_gates "${tag#app:}"
  done <<EOF
$app_tags
EOF
fi

# 5. Legacy root-level Node gates.
if has_bucket node; then
  pkg="$root/package.json"
  if [[ ! -f "$pkg" ]]; then
    echo "Error: package.json not found at $pkg (Node files staged)" >&2
    exit 1
  fi

  existing=()
  for g in "${gates[@]}"; do
    if grep -qE "\"$g\"\\s*:\\s*\"" "$pkg"; then
      existing+=("$g")
    fi
  done

  if [[ ${#existing[@]} -eq 0 ]]; then
    echo "Error: package.json declares none of the recognized sanity gates: ${gates[*]}" >&2
    echo "Add at least one (e.g., \"lint\": \"eslint .\") before running /implement." >&2
    exit 1
  fi

  for g in "${existing[@]}"; do
    echo "▶ npm run $g"
    if ! npm run "$g"; then
      echo "✗ gate '$g' failed" >&2
      fail=1
    fi
    ran_any=1
  done
fi

# 6. Shell gate (bash -n).
if has_bucket shell; then
  while IFS= read -r path; do
    case "$path" in
      *.sh|*.bash) ;;
      *) continue ;;
    esac
    [[ -f "$path" ]] || continue
    echo "▶ bash -n $path"
    if ! bash -n "$path"; then
      echo "✗ bash -n failed: $path" >&2
      fail=1
    fi
    ran_any=1
  done <<EOF
$staged_paths
EOF
fi

# 6. Docs / other — no gate.
if has_bucket docs; then
  echo "▶ docs bucket — no gate (skipped)"
fi
if has_bucket other; then
  echo "▶ other bucket — no gate (skipped)"
fi

# 7. No applicable gate ran.
if [[ $ran_any -eq 0 && $fail -eq 0 ]]; then
  echo "no auditable changes; gates skipped"
  exit 0
fi

# 8. Aggregate result.
if [[ $fail -ne 0 ]]; then
  exit 1
fi

echo "✓ all applicable gates passed"
