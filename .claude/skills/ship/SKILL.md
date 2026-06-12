---
name: ship
description: Take a PR with spec:approved and code:approved through merge cleanly. Marks ready, squash-merges, transitions the issue to phase:shipped, deletes the remote branch, and cleans up the local worktree and branch.
---

# /ship

> **Root anchoring.** All paths in this skill are root-relative. Before any
> file operation, ensure cwd is the repo root
> (`cd "$(git rev-parse --show-toplevel)"`).

## When to use

A feature is fully approved (`spec:approved` AND `code:approved` on the
PR), the issue is at `phase:review`, and you're ready to merge.

Skip when:
- Either label is missing — the gate refuses anyway, but save yourself
  the round-trip.
- The PR is on `main` (force-pushes to main are out of scope; this skill
  only operates on feature branches).

## Inputs

- `/ship` — uses the current branch's PR.
- `/ship <pr-number>` — explicit PR.

## Workflow

### 1. Resolve PR and issue

```bash
pr=${1:-$(.claude/skills/implement/helpers/current-pr.sh)}
issue=$(gh pr view "$pr" --json body --jq .body | grep -oE 'Closes #[0-9]+' | head -1 | grep -oE '[0-9]+')
```

If `Closes #N` is absent from the PR body, surface the error and stop —
the issue lifecycle cannot be advanced without it.

### 2. Gate on both labels

```bash
.claude/skills/ship/helpers/verify-ready-to-ship.sh "$pr"
```

The helper exits with the count of missing labels (0, 1, or 2). Surface
its stderr; on non-zero, stop.

### 3. Mark PR ready

```bash
gh pr ready "$pr"
```

### 4a. Squash-merge

```bash
title=$(gh pr view "$pr" --json title --jq .title)
gh pr merge "$pr" --squash --subject "$title" --body "Closes #$issue"
```

This squashes the PR's commits into a single commit on `main` whose
subject matches the PR title (GitHub appends ` (#<pr>)` server-side as
it does today) and whose body is exactly `Closes #<issue>` — keeping
`main` clean of the `wip(#N): attempt M — <signature>` commits the
bounded implementation loop produces on the PR branch (ADR 0003
principle 3). The branch's individual commits remain visible inside
the closed-PR view for reviewer archaeology.

Explicit `--subject` / `--body` matter: the default squash body
concatenates every source commit message, which would re-import the
WIP signatures into the squashed commit body. The flags pin the
output to exactly what `main` should carry. See
[spec 054](../../../docs/specs/054-migrate-ship-from-rebase-merge-to-squash.md).

We do **not** pass `--delete-branch`: when the merge happens from
inside a worktree, gh's post-merge cleanup tries to update the local
`main` ref and exits non-zero with `'main' is already used by worktree
at <main-repo>` (the merge itself succeeds, but the surrounding skill
flow aborts on the non-zero exit). See spec 020 for the full incident
log.

### 4b. Delete the remote branch

```bash
.claude/skills/ship/helpers/delete-remote-branch.sh "$branch"
```

The helper deletes the remote ref via `gh api -X DELETE` and is
idempotent — a missing ref ("Reference does not exist" / "Not Found")
is treated as success. The local branch is removed later by
`cleanup-worktree.sh` in step 6.

### 5. Transition the issue label

```bash
.claude/skills/_shared/helpers/transition-issue-label.sh "$issue" phase:review phase:shipped
```

The transition is adjacent-only.

### 6. Auto-cleanup of the worktree and local branch

Identify the worktree path and the branch:

```bash
wt=$(git rev-parse --show-toplevel)
branch=$(git rev-parse --abbrev-ref HEAD)
```

Identify the main repository path (the one that owns all worktrees):

```bash
main_repo=$(git -C "$wt" rev-parse --git-common-dir | xargs dirname)
```

Run cleanup:

```bash
.claude/skills/ship/helpers/cleanup-worktree.sh "$wt" "$branch" "$main_repo"
```

The helper handles two cases:

- **Worktree case** (`wt != main_repo`): removes the worktree (if
  registered) and the local branch (if present), idempotently.
- **Main-checkout case** (`wt == main_repo`): skips worktree removal
  (the active checkout cannot be removed), then switches to `main`,
  deletes the local feature branch, and fast-forwards `main` to origin
  so the next session starts clean. Refuses to delete `main` itself.

In both cases the helper prints a one-line summary on stdout and exits 0.

### 7. Report back

Print:

```
Merged: <pr-url>
Issue:  <issue-url>  (now phase:shipped, closed)
Cleanup: <summary from cleanup-worktree.sh>

If your shell is now in a removed worktree, cd <main_repo> to continue.
```

## Anti-patterns

- **Force-pushing past the label gate.** The labels exist for a reason;
  if you must override, change the helper, do not bypass it.
- **Rebase- or merge-committing.** Re-introduces every `wip(#N): attempt
  M — <signature>` commit produced by the bounded implementation loop
  onto `main`, which ADR 0003 principle 3 explicitly forbids. Squash
  is the project default; do not switch back without amending the ADR.
- **Squash without explicit `--subject` / `--body`.** GitHub's default
  squash body concatenates every source commit message, so the WIP
  signatures end up in the squashed commit body even though only one
  commit lands on `main`. The flags are load-bearing.
- **Removing the main checkout.** The cleanup helper guards against this;
  do not edit it out.
- **Removing the worktree before the merge succeeded.** The skill orders
  steps deliberately; do not rearrange.

## Output contract

On success: PR squash-merged (step 4a) so `main` carries a single
commit per PR, remote branch deleted via explicit helper (step 4b),
issue closed and at `phase:shipped`, local worktree + branch removed
(when they were not the main checkout).

On gate failure: nothing changed, stderr names what is missing.

On merge failure (e.g., conflict, CI red): the PR stays open in its
prior state; the contributor resolves and re-runs `/ship`.

## See also

- [`examples/README.md`](examples/README.md) — sample transcript.
- [`/implement`](../implement/SKILL.md) — upstream skill.
- [`/code-review`](../code-review/SKILL.md) — upstream gate.
- [`/spec-review`](../spec-review/SKILL.md) — upstream gate.
