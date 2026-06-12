---
name: pickup
description: Take over an in-flight feature handed off by another contributor. Reads the latest handoff comment, the spec, and the branch state; reassigns the issue to @me; produces a plain-text briefing.
---

# /pickup

## When to use

You are stepping into a feature someone else was working on. There is
an issue with a recent handoff comment posted by `/handoff`. You want
the briefing before reading the diff.

Skip when:
- No handoff comment exists — the work has not been formally handed
  off. Run `/status` against the previous owner and ask them in chat,
  or just open the spec and figure it out (then post your own handoff
  later).
- The PR is already merged — nothing to pick up.

## Inputs

- `/pickup` — uses the current branch's PR.
- `/pickup <pr-number>` — explicit PR.

## Workflow

### 1. Resolve PR and issue

```bash
pr=${1:-$(.claude/skills/implement/helpers/current-pr.sh)}
issue=$(gh pr view "$pr" --json body --jq .body | grep -oE 'Closes #[0-9]+' | head -1 | grep -oE '[0-9]+')
```

If `Closes #N` is absent, surface the error and stop.

### 2. Load the latest handoff comment

```bash
.claude/skills/pickup/helpers/load-latest-handoff.sh "$issue" > /tmp/handoff-comment.md
```

If the helper exits non-zero, the issue has no handoff comment. Surface
its stderr (`no handoff comment found on issue #N`) and stop. Do not
proceed to reassign — picking up "nothing" silently is worse than
asking the user to investigate.

### 3. Reassign to @me

```bash
gh issue edit "$issue" --add-assignee @me
```

GitHub allows multi-assignment; this does not remove existing
assignees. `/handoff` already removed the previous owner, so this is
typically the only assignee after the call.

### 4. Pull the branch

```bash
branch=$(gh pr view "$pr" --json headRefName --jq .headRefName)
git fetch origin "$branch" --quiet
# Switch only if not already on it (the contributor may have pre-cd'd)
current=$(git rev-parse --abbrev-ref HEAD)
if [[ "$current" != "$branch" ]]; then
  git switch "$branch"
fi
```

### 5. Compose a briefing

Read three sources:

- The handoff comment at `/tmp/handoff-comment.md`.
- The spec — locate via the spec-review helper:
  `.claude/skills/spec-review/helpers/load-spec.sh <pr>`.
- The PR diff: `gh pr diff <pr>`.

Produce a plain-text briefing with this shape:

```
Picked up issue #<N> on branch <branch>.

Handoff context (from latest /handoff comment):
  Author:           @<author>
  Posted:           <timestamp>
  Last commit:      <sha> <subject>
  Spec progress:    <one-line summary derived from the comment's progress section>
  Open decisions:   <one-line summary, or "(none)">
  Gotchas:          <one-line summary, or "(none)">
  Suggested next:   <verbatim from comment>

What I would do next (deterministic):
  - <hint derived from PR labels, same logic as /status>
```

The deterministic next-step hint follows the same state machine as
`/status` (spec 023 §4.4): if `spec:approved` and `code:approved`, run
`/ship`; if only `spec:approved`, run `/implement` or `/code-review`;
etc.

### 6. Print the briefing

Display verbatim. The contributor can act on it directly.

## Anti-patterns

- **Reassigning before confirming a handoff exists.** If no handoff is
  found, do not silently grab the issue — that loses the previous
  owner's context.
- **Picking up multiple issues at once.** One issue per `/pickup`. The
  briefing depends on one set of context.
- **Rewriting the briefing as prose.** The shape is the contract; the
  fixed structure is what makes the briefing scannable.
- **Skipping the spec read.** The briefing's value is in connecting the
  handoff comment to the actual spec; do not omit.

## Output contract

On success: issue assignee includes `@me`; the local branch is checked
out; the briefing has been printed.

On failure (no handoff, gh error, branch missing): nothing has been
reassigned. Surface stderr and stop.

## See also

- [`examples/README.md`](examples/README.md) — sample transcript.
- [`/handoff`](../handoff/SKILL.md) — the upstream side.
- [`/status`](../status/SKILL.md) — useful after `/pickup` to confirm
  the new view.
