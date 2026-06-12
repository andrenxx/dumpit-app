#!/usr/bin/env bash
# ux-research.sh — Assemble the UX research + options section for a
# discovery issue body.
#
# Usage:
#   ux-research.sh <research-tmp> <options-tmp>
#
# Args:
#   <research-tmp>  Path to a tmp file containing the three research
#                   passes the skill produced (use-case, competitors,
#                   internal). Plain markdown.
#   <options-tmp>   Path to a tmp file containing the three option
#                   blocks (A, B, C) per the template at
#                   helpers/ux-option.md. Plain markdown.
#
# Exit:
#   0  — prints the assembled markdown section to stdout.
#   1  — usage or missing input.
#
# This helper is intentionally dumb: it does not call subagents, does
# not validate option count, does not enforce constraints. The skill
# (discover/SKILL.md §2.5) is responsible for producing well-formed
# inputs; this helper just composes them into the canonical section
# layout that ends up in the issue body.
#
# Spec 038 §4.4.3.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <research-tmp> <options-tmp>" >&2
  exit 1
fi

research="$1"
options="$2"

if [[ ! -f "$research" ]]; then
  echo "Error: research file not found: $research" >&2
  exit 1
fi

if [[ ! -f "$options" ]]; then
  echo "Error: options file not found: $options" >&2
  exit 1
fi

cat <<'HEADER'
### UX research

HEADER

cat "$research"

cat <<'SEPARATOR'

### UX options

> Three framed options. The chosen one becomes the first commit of the
> implementation spec; the rationale lives in the spec's §4.5 UX
> decision block. See `.claude/skills/discover/helpers/ux-option.md`
> for the option-block template.

SEPARATOR

cat "$options"
