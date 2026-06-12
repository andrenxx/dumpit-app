#!/usr/bin/env bash
# classify-diff.sh — Classify a list of paths into language buckets.
#
# Usage:
#   echo -e "src/foo.ts\nscripts/bar.sh" | classify-diff.sh
#
# Reads paths from stdin (one per line). Emits zero or more bucket tags
# to stdout, sorted and unique, one per line. Buckets:
#
#   app:<name> — any path under apps/<name>/ (matches before extension
#                rules; <name> must be [a-z0-9-]+). Per-app sanity
#                gates live in apps/<name>/package.json (spec 103).
#   node       — *.ts, *.tsx, *.js, *.jsx, *.mjs, *.cjs, package.json,
#                tsconfig*.json, next.config.*, eslint.config.* outside
#                of apps/
#   shell      — *.sh, *.bash
#   docs       — *.md, *.mdx, files under docs/
#   other      — anything else
#
# Pure: same input → same output. No side effects, no git calls.
# Empty input → no output, exit 0 (caller decides what empty means).

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

# Use plain space-separated list of seen tags (avoids bash 3.2 limits).
seen=" "

mark() {
  case "$seen" in
    *" $1 "*) ;;
    *) seen="$seen$1 " ;;
  esac
}

classify_path() {
  local p="$1"
  # Per-app rule first: any path under apps/<name>/ tags app:<name>
  # exclusively (no further classification). <name> must be [a-z0-9-]+.
  if [[ "$p" =~ ^apps/([a-z0-9-]+)/ ]]; then
    mark "app:${BASH_REMATCH[1]}"
    return
  fi
  case "$p" in
    *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs)
      mark node; return ;;
    package.json|*/package.json)
      mark node; return ;;
    tsconfig.json|tsconfig.*.json|*/tsconfig.json|*/tsconfig.*.json)
      mark node; return ;;
    next.config.*|*/next.config.*)
      mark node; return ;;
    eslint.config.*|*/eslint.config.*)
      mark node; return ;;
    *.sh|*.bash)
      mark shell; return ;;
    *.md|*.mdx)
      mark docs; return ;;
    docs/*)
      mark docs; return ;;
    *)
      mark other; return ;;
  esac
}

while IFS= read -r path; do
  [[ -z "$path" ]] && continue
  classify_path "$path"
done

# Emit sorted unique tags. (No-op when no tags were marked.)
trimmed="${seen## }"
trimmed="${trimmed%% }"
if [[ -n "$trimmed" ]]; then
  printf '%s\n' $trimmed | sort -u
fi
