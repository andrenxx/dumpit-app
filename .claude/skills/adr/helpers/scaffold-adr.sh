#!/usr/bin/env bash
# scaffold-adr.sh — Copy the ADR template and fill metadata.
#
# Usage:
#   scaffold-adr.sh <nnnn> <slug> <title>
#
# Output:
#   Path to the created ADR file (relative to repo root) on stdout.
#
# Behavior:
#   - Resolves the repo root via `git rev-parse --show-toplevel`.
#   - Reads template at `<root>/docs/architecture/decisions/_template.md`.
#   - Replaces the metadata header (lines 1–6) with a freshly composed
#     block: title set to <title>, status to "Proposed", date to today
#     (UTC, ISO 8601). The body of the template (Context, Decision,
#     Consequences sections and any preface notes) is preserved verbatim.
#   - Writes to `<root>/docs/architecture/decisions/<nnnn>-<slug>.md`.
#   - Refuses to overwrite an existing file.
#   - Does NOT call the LLM. Section drafting is the SKILL.md's job.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -ne 3 ]]; then
  echo "Usage: $0 <nnnn> <slug> <title>" >&2
  exit 1
fi

nnnn="$1"
slug="$2"
title="$3"

if ! [[ "$nnnn" =~ ^[0-9]{4}$ ]]; then
  echo "Error: nnnn must be exactly 4 digits (got: $nnnn)" >&2
  exit 1
fi

if [[ -z "$slug" ]]; then
  echo "Error: slug must not be empty" >&2
  exit 1
fi

if [[ -z "$title" ]]; then
  echo "Error: title must not be empty" >&2
  exit 1
fi

repo_root=$(git rev-parse --show-toplevel)
template="$repo_root/docs/architecture/decisions/_template.md"
target="$repo_root/docs/architecture/decisions/$nnnn-$slug.md"

if [[ ! -f "$template" ]]; then
  echo "Error: ADR template not found at $template" >&2
  exit 1
fi

if [[ -e "$target" ]]; then
  echo "Error: ADR file already exists at $target" >&2
  exit 1
fi

today=$(date -u +%Y-%m-%d)

# Compose the new metadata block + everything after line 6 of the template
# (which is the body — the "How to use" preface and the Context/Decision/
# Consequences sections).
{
  cat <<EOF
# ADR $nnnn — $title

| Field  | Value                                                |
| ------ | ---------------------------------------------------- |
| Status | Proposed                                             |
| Date   | $today                                               |
EOF
  tail -n +7 "$template"
} > "$target"

echo "docs/architecture/decisions/$nnnn-$slug.md"
