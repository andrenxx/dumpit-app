#!/usr/bin/env bash
# gather-state.sh — Output current handoff state as JSON.
#
# Usage:
#   gather-state.sh <pr-number> <issue-number>
#
# Output:
#   JSON object on stdout:
#     {
#       "branch": "feat/N-slug",
#       "last_commit": {"sha": "abc1234", "subject": "..."},
#       "commit_count": 3,
#       "touched_paths_top": ["src/lib/foo.ts", ".claude/skills/bar/SKILL.md", ...],
#       "issue_labels": ["phase:implementing", "type:feature"],
#       "pr_labels": ["spec:approved"]
#     }
#
# Notes:
#   - "commit_count" is the number of commits since branching off
#     origin/main.
#   - "touched_paths_top" is up to 10 paths, alphabetical, deduped.
#   - No mutation. Pure read.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <pr-number> <issue-number>" >&2
  exit 1
fi

pr="$1"
issue="$2"

if ! [[ "$pr" =~ ^[0-9]+$ ]] || [[ "$pr" -lt 1 ]]; then
  echo "Error: pr-number must be a positive integer (got: $pr)" >&2
  exit 1
fi

if ! [[ "$issue" =~ ^[0-9]+$ ]] || [[ "$issue" -lt 1 ]]; then
  echo "Error: issue-number must be a positive integer (got: $issue)" >&2
  exit 1
fi

git fetch origin main --quiet

branch=$(git rev-parse --abbrev-ref HEAD)
last_sha=$(git log -1 --pretty=format:'%h')
last_subject=$(git log -1 --pretty=format:'%s')
commit_count=$(git rev-list --count origin/main..HEAD)

# Up to 10 touched paths, deduped, sorted.
touched_json=$(git diff --name-only origin/main...HEAD \
  | sort -u \
  | head -10 \
  | jq -R . \
  | jq -s .)

issue_labels_json=$(gh issue view "$issue" --json labels --jq '[.labels[].name]')
pr_labels_json=$(gh pr view "$pr" --json labels --jq '[.labels[].name]')

jq -n \
  --arg branch "$branch" \
  --arg sha "$last_sha" \
  --arg subject "$last_subject" \
  --argjson commit_count "$commit_count" \
  --argjson touched "$touched_json" \
  --argjson issue_labels "$issue_labels_json" \
  --argjson pr_labels "$pr_labels_json" \
  '{
    branch: $branch,
    last_commit: {sha: $sha, subject: $subject},
    commit_count: $commit_count,
    touched_paths_top: $touched,
    issue_labels: $issue_labels,
    pr_labels: $pr_labels
  }'
