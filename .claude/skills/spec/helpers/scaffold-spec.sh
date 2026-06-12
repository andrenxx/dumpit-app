#!/usr/bin/env bash
# scaffold-spec.sh — Copy spec template to docs/specs/NNN-slug.md and fill metadata.
#
# Usage:
#   scaffold-spec.sh <issue-number> <slug> <branch-type>
#   scaffold-spec.sh <issue-number> <slug>                  # deprecated, defaults to feat
#
# Arguments:
#   <branch-type> — one of: feat, fix, chore. Determines the prefix
#                   substituted into the template's Branch cell. Resolved
#                   by SKILL.md (see spec 014).
#
# Output:
#   Path to the created spec file (relative to repo root) on stdout.
#
# Behavior:
#   - Resolves repo root via `git rev-parse --show-toplevel`.
#   - Reads template at <repo-root>/docs/specs/_template.md.
#   - Fills three deterministic substitutions:
#       1. "# Spec NNN — <Title>" → "# Spec <padded> — <Title>"
#       2. Issue link "[#N](.../issues/N)" → "[#<N>](.../issues/<N>)" with current OWNER/REPO.
#       3. Branch placeholder "feat/N-<slug>" → "<type>/<N>-<slug>".
#   - Leaves <Title>, Status, and Type as template placeholders for the LLM
#     pass that runs from SKILL.md.
#   - Refuses to overwrite an existing spec file.
#   - Refuses any <branch-type> other than feat|fix|chore.
#   - Does NOT call the LLM. Section drafting is the SKILL.md's job.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -lt 2 || $# -gt 3 ]]; then
  echo "Usage: $0 <issue-number> <slug> <branch-type>" >&2
  exit 1
fi

n="$1"
slug="$2"

if [[ $# -eq 3 ]]; then
  type="$3"
else
  echo "warn: scaffold-spec.sh called without <branch-type>; defaulting to 'feat'. Pass an explicit type (feat|fix|chore) — two-arg form is deprecated." >&2
  type="feat"
fi

if ! [[ "$type" =~ ^(feat|fix|chore)$ ]]; then
  echo "Error: branch-type must be one of: feat, fix, chore (got: $type)" >&2
  exit 2
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
shared="$script_dir/../../_shared/helpers"

nnn=$("$shared/next-spec-num.sh" "$n")
repo=$("$shared/repo-info.sh")

repo_root=$(git rev-parse --show-toplevel)
template="$repo_root/docs/specs/_template.md"
target="$repo_root/docs/specs/$nnn-$slug.md"

if [[ ! -f "$template" ]]; then
  echo "Error: spec template not found at $template" >&2
  exit 1
fi

if [[ -e "$target" ]]; then
  echo "Error: target spec file already exists: $target" >&2
  exit 1
fi

sed \
  -e "s|^# Spec NNN —|# Spec $nnn —|" \
  -e "s|\[#N\](https://github.com/aurora-crista/pregacao-dev/issues/N)|[#$n](https://github.com/$repo/issues/$n)|" \
  -e "s|\`feat/N-<slug>\`|\`$type/$n-$slug\`|" \
  "$template" > "$target"

# Print path relative to repo root for stable output regardless of cwd.
echo "docs/specs/$nnn-$slug.md"
