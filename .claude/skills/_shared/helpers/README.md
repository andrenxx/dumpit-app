# Shared helpers

Helpers reused across multiple skills live here so they have a single
authoritative implementation.

## Contract

Every helper:

- Is bash, starts with `#!/usr/bin/env bash` and `set -euo pipefail`.
- Has a single responsibility — one helper per atomic operation.
- Documents its usage and contract in a top-of-file comment block.
- Prints a one-line error to stderr and exits non-zero on failure.
- Does **not** call any LLM. Helpers are deterministic; LLM judgement
  belongs in `SKILL.md` workflow steps.

## Catalog

| Helper                       | Purpose                                                                                |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| `slugify.sh`                 | Title → kebab-case slug (max 40 chars, ASCII).                                         |
| `next-spec-num.sh`           | Issue number → 3-digit zero-padded spec number.                                        |
| `repo-info.sh`               | Output `OWNER/REPO` for the current git repo via `gh`.                                 |
| `transition-issue-label.sh`  | Move an issue between adjacent `phase:*` labels; refuses skips and backward moves.     |

Run any helper with no arguments (or invalid input) to see its usage.
