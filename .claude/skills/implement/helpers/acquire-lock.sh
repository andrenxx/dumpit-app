#!/usr/bin/env bash
# acquire-lock.sh — Write the /implement lock file from a spec's §5.
#
# Usage:
#   acquire-lock.sh <spec-path>
#
# Behavior:
#   - Parses §5 via parse-spec-files.sh.
#   - Writes JSON to .claude/.implement-lock with spec_path, files[],
#     and acquired_at (ISO-8601 UTC).
#   - Stale lock pointing at the same spec → overwrite with a one-line
#     stderr warning.
#   - Stale lock pointing at a different spec → hard-error (the user
#     must resolve manually).
#
# Spec 049 §4.1.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <spec-path>" >&2
  exit 1
fi

spec="$1"
root=$(git rev-parse --show-toplevel)
lock="$root/.claude/.implement-lock"

if [[ ! -f "$root/$spec" ]] && [[ ! -f "$spec" ]]; then
  echo "Error: spec file not found: $spec" >&2
  exit 1
fi

# Normalize spec to repo-relative.
case "$spec" in
  /*) spec="${spec#"$root"/}" ;;
  *)  spec="${spec#./}" ;;
esac

# Detect stale lock.
if [[ -f "$lock" ]]; then
  existing=$(python3 -c '
import json, sys
try:
    with open(sys.argv[1]) as f:
        d = json.load(f)
    print(d.get("spec_path") or "")
except Exception:
    print("")
' "$lock")
  if [[ "$existing" == "$spec" ]]; then
    echo "warn: stale .implement-lock from a previous run; overwriting." >&2
  elif [[ -n "$existing" ]]; then
    cat >&2 <<EOF
Error: .implement-lock already exists and points at a different spec:
  existing: $existing
  new:      $spec

A previous /implement crashed without releasing, or two runs are
trying to share the worktree. Resolve manually:
  rm .claude/.implement-lock
EOF
    exit 1
  fi
fi

mkdir -p "$root/.claude"

files_list=$("$root/.claude/hooks/parse-spec-files.sh" "$root/$spec")

now=$(date -u +'%Y-%m-%dT%H:%M:%SZ')

SPEC="$spec" NOW="$now" FILES="$files_list" python3 - "$lock" <<'PY'
import json, os, sys
lock = sys.argv[1]
files = [l for l in os.environ["FILES"].splitlines() if l.strip()]
data = {
    "spec_path": os.environ["SPEC"],
    "files": files,
    "acquired_at": os.environ["NOW"],
}
with open(lock, "w") as f:
    json.dump(data, f, indent=2)
    f.write("\n")
PY

printf '%s\n' "$lock"
