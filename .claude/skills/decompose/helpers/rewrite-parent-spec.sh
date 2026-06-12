#!/usr/bin/env bash
# rewrite-parent-spec.sh — Replace the parent spec body with a decomposition record.
#
# Usage:
#   rewrite-parent-spec.sh <parent-spec-path> <children-json-file>
#
# Behavior:
#   - Preserves the parent spec's metadata header (title + table from
#     lines 1 to the first blank line after the metadata table).
#   - Updates the Status row in the metadata table to
#     "Decomposed — tracking children".
#   - Replaces the body (everything after the metadata header) with a
#     fresh decomposition record describing each child from the JSON.
#   - Writes a backup of the original to <path>.pre-decompose.md so a
#     reviewer can diff if they want to recover.
#
# Children JSON shape (file content):
#   [
#     {"number": 42, "title": "Add OGG support", "summary": "...", "branch": "feat/42-..."},
#     {"number": 43, "title": "Streaming concat", "summary": "...", "branch": "feat/43-..."}
#   ]
#
# `pr_url` is intentionally absent. /decompose creates the issue and
# branch but does NOT open a PR for each child — that happens when a
# contributor runs /spec <child> on the child's branch.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <parent-spec-path> <children-json-file>" >&2
  exit 1
fi

spec="$1"
children_json="$2"

if [[ ! -f "$spec" ]]; then
  echo "Error: parent spec file not found: $spec" >&2
  exit 1
fi

if [[ ! -f "$children_json" ]]; then
  echo "Error: children JSON file not found: $children_json" >&2
  exit 1
fi

# Validate JSON shape minimally.
if ! jq -e 'type == "array" and length > 0' "$children_json" >/dev/null; then
  echo "Error: children JSON must be a non-empty array" >&2
  exit 1
fi

# Backup the original (one cycle of recovery).
backup="${spec%.md}.pre-decompose.md"
cp "$spec" "$backup"

# Extract section 2.5 (Validation strategy) from the source spec, if
# present. Fence-aware: lines inside markdown code fences do not trigger
# the heading match. The captured block is later injected into the
# rewritten body before section 3.
#
# State machine:
#   - BEFORE: scanning until the real `## 2.5 ...` heading.
#   - CAP   : capturing the body.
#   - AFTER : the next top-level `## ` heading ended the section; skip.
inherited_2_5=$(awk '
  /^```/ {
    in_fence = !in_fence
    if (state == "CAP") print
    next
  }
  state == "AFTER" { next }
  state == "CAP" && !in_fence && /^## / { state = "AFTER"; next }
  state == "CAP" { print; next }
  state == "" && !in_fence && /^## 2\.5( |$)/ {
    state = "CAP"
    print "## 2.5 Validation strategy (inherited from pre-decompose)"
    next
  }
' "$spec")

# Extract the metadata header: everything up to and including the first
# blank line that follows the table. The table ends when we hit a line
# that is empty after we've seen at least one "| ... |" row.
header=$(awk '
  /^\|/ { in_table = 1 }
  in_table && /^[[:space:]]*$/ { print; exit }
  { print }
' "$spec")

# Update the Status row inside the header.
# Note: using `~` as the sed delimiter because `\|` under `sed -E` on macOS
# is interpreted as alternation, not a literal pipe. With `~` as the
# delimiter we can write the pipes literally without escaping.
header_updated=$(echo "$header" | sed -E 's~^\| Status   \|.*\|$~| Status   | Decomposed — tracking children                                                       |~')

# Compose the new body from the children JSON.
body=$(jq -r '
  "## 1. Context\n\nThis spec was decomposed by `/decompose` because the original scope was too large for a single PR. The original body has been preserved at this file with the suffix `.pre-decompose.md` for recovery; the canonical record going forward is the table of children below.\n\n## 2. Children\n\nEach child has an issue and a branch on origin. PRs are opened when a contributor runs `/spec <child-number>` on the child branch.\n\n| # | Title | Branch |\n| - | ----- | ------ |\n" +
  (map("| #\(.number) | \(.title) | `\(.branch)` |") | join("\n")) +
  "\n\n### Summaries\n\n" +
  (map("- **#\(.number) \(.title).** \(.summary)") | join("\n")) +
  "\n\n## 3. Acceptance (parent-level)\n\n- [ ] Each child has been picked up via `/spec <child>` and progressed through the standard flow.\n- [ ] All children listed above are merged.\n- [ ] Decomposition record (this spec) ships as a small docs PR through the normal flow.\n\n## 4. Risks and Rollout\n\nDecomposition itself is a low-risk operation; the substantive risks live in each child spec. Rollout: each child proceeds independently through the standard /spec → /implement → /code-review → /ship loop. Sibling order is the human'\''s call (no automated blocking)."
' "$children_json")

# If the source spec had a populated section 2.5, inject it into the
# rewritten body just before "## 3. Acceptance (parent-level)". Empty
# 2.5 → no placeholder, no injection.
#
# Use a temp file for the block (BSD awk on macOS rejects newlines in
# `-v var=value`). Split the body around the Acceptance heading and
# concatenate.
if [[ -n "$inherited_2_5" ]]; then
  pre=$(printf '%s\n' "$body" | awk '/^## 3\. Acceptance/ { exit } { print }')
  post=$(printf '%s\n' "$body" | awk '/^## 3\. Acceptance/ { found = 1 } found { print }')
  body=$(printf '%s\n%s\n\n%s' "$pre" "$inherited_2_5" "$post")
fi

# Write the new spec.
{
  echo "$header_updated"
  echo
  echo "$body"
} > "$spec"

echo "Rewrote $spec (backup at $backup)."
