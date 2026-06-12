#!/usr/bin/env bash
# query-my-work.sh — Query open issues and PRs for a user, output JSON.
#
# Usage:
#   query-my-work.sh           # uses @me
#   query-my-work.sh <user>    # explicit GitHub login (no @)
#
# Output:
#   JSON object with two arrays:
#     {
#       "user": "<login>",
#       "repo": "<owner/repo>",
#       "issues": [{number, title, labels:[...]}],
#       "prs":    [{number, title, isDraft, labels:[...], body}]
#     }
#
# Notes:
#   - "Issues" filters out PRs (gh issue list also returns PRs by default).
#   - "PRs" includes the body so the caller can match `Closes #N` to issues.
#   - No mutation. Safe to run any number of times.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

user="${1:-@me}"

repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner)

if [[ "$user" == "@me" ]]; then
  issues_filter='--assignee=@me'
  prs_filter='--author=@me'
  user_label="@me"
else
  # Strip leading @ if present.
  login="${user#@}"
  issues_filter="--assignee=$login"
  prs_filter="--author=$login"
  user_label="$login"
fi

# Query issues (gh issue list) — filters out PRs already.
issues_json=$(gh issue list \
  $issues_filter \
  --state open \
  --limit 100 \
  --json number,title,labels)

# Query PRs (gh pr list).
prs_json=$(gh pr list \
  $prs_filter \
  --state open \
  --limit 100 \
  --json number,title,isDraft,labels,body)

# Compose final JSON via jq.
jq -n \
  --arg user "$user_label" \
  --arg repo "$repo" \
  --argjson issues "$issues_json" \
  --argjson prs "$prs_json" \
  '{user: $user, repo: $repo, issues: $issues, prs: $prs}'
