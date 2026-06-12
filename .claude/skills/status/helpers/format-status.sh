#!/usr/bin/env bash
# format-status.sh — Pretty-print the JSON from query-my-work.sh.
#
# Usage:
#   format-status.sh <json-file>
#
# Behavior:
#   - Reads JSON from a file.
#   - Groups issues by phase:* label.
#   - Lists PRs with their gate label state.
#   - Computes next-action hints via the deterministic state machine in
#     spec 023 §4.4. Unknown combinations print a literal fallback.
#   - No LLM. No network calls. Pure jq + bash.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <json-file>" >&2
  exit 1
fi

json="$1"
if [[ ! -f "$json" ]]; then
  echo "Error: JSON file not found: $json" >&2
  exit 1
fi

# ── State-machine helpers (defined first; called below) ───────────

pr_hint() {
  local labels="$1"
  local has_spec=0
  local has_code=0
  [[ "$labels" == *"spec:approved"* ]] && has_spec=1
  [[ "$labels" == *"code:approved"* ]] && has_code=1

  if [[ $has_spec -eq 1 && $has_code -eq 1 ]]; then
    echo "run /ship to merge"
  elif [[ $has_spec -eq 1 ]]; then
    echo "run /implement (or continue) and then /code-review"
  elif [[ $has_code -eq 1 ]]; then
    echo "spec was edited after approval; run /spec-review to re-confirm"
  else
    echo "run /spec-review to apply spec:approved"
  fi
}

# Find the open PR whose body has `Closes #<issue>`. Outputs the
# pipe-joined "number|labels" of the first match, or empty if none.
pr_state_for_issue() {
  local issue_num="$1"
  local jsonfile="$2"
  jq -r --arg n "$issue_num" \
    '.prs[] | select(.body | tostring | test("Closes #" + $n + "($|[^0-9])")) | "\(.number)|\([.labels[].name] | join(","))"' \
    "$jsonfile" | head -1
}

issue_hint() {
  local phase="$1"
  local issue_num="$2"
  local jsonfile="$3"

  case "$phase" in
    phase:discovery)
      echo "run /spec to convert into a feature spec"
      ;;
    phase:spec)
      local prs
      prs=$(pr_state_for_issue "$issue_num" "$jsonfile")
      if [[ -z "$prs" ]]; then
        echo "run /spec to start drafting"
      else
        pr_hint "${prs#*|}"
      fi
      ;;
    phase:implementing)
      echo "implementation in progress; run /code-review when done"
      ;;
    phase:review)
      local prs
      prs=$(pr_state_for_issue "$issue_num" "$jsonfile")
      if [[ -z "$prs" ]]; then
        echo "(unrecognized state — no suggestion)"
      else
        pr_hint "${prs#*|}"
      fi
      ;;
    phase:shipped)
      echo "done"
      ;;
    *)
      echo "(unrecognized state — no suggestion)"
      ;;
  esac
}

# ── Header ─────────────────────────────────────────────────────────

user=$(jq -r '.user' "$json")
repo=$(jq -r '.repo' "$json")

echo "Status for $user — $repo"
echo ""

# ── Issues ─────────────────────────────────────────────────────────

issue_count=$(jq '.issues | length' "$json")
echo "Issues ($issue_count open)"

if [[ "$issue_count" -eq 0 ]]; then
  echo "  (none)"
else
  for phase in phase:discovery phase:spec phase:implementing phase:review phase:shipped; do
    matching=$(jq -r --arg phase "$phase" \
      '.issues[] | select(any(.labels[]; .name == $phase)) | "\(.number)|\(.title)"' \
      "$json")

    [[ -z "$matching" ]] && continue

    echo "  $phase"
    while IFS='|' read -r num title; do
      [[ -z "$num" ]] && continue
      hint=$(issue_hint "$phase" "$num" "$json")
      printf "    #%-4s %s\n" "$num" "$title"
      printf "          → %s\n" "$hint"
    done <<< "$matching"
  done
fi
echo ""

# ── PRs ────────────────────────────────────────────────────────────

pr_count=$(jq '.prs | length' "$json")
echo "PRs ($pr_count open)"

if [[ "$pr_count" -eq 0 ]]; then
  echo "  (none)"
else
  jq -r '.prs[] | "\(.number)|\(if .isDraft then "draft" else "ready" end)|\(.title)|\([.labels[].name] | join(","))"' "$json" \
    | while IFS='|' read -r num state title labels; do
        [[ -z "$num" ]] && continue
        printf "  #%-3s (%s)  %s\n" "$num" "$state" "$title"
        if [[ -n "$labels" ]]; then
          printf "        labels: %s\n" "$labels"
        else
          printf "        labels: (none)\n"
        fi
        printf "        → %s\n" "$(pr_hint "$labels")"
      done
fi
