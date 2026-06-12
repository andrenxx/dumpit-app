---
name: handoff
description: Capture in-flight work state into a structured GitHub issue comment with a marker, optionally reassigning the issue. The receiving contributor uses /pickup to read it back.
---

# /handoff

## When to use

You are mid-feature, the work has progressed past the spec, and you
need to stop or pass to another contributor. The branch is pushed; the
PR exists; the spec is `spec:approved`.

Skip when:
- The work has not started (branch has no commits beyond the spec).
- You are stepping away for less than a few hours and intend to keep
  ownership — assign-to-yourself plus a one-line PR comment is enough.
- The PR is already shipped — nothing to hand off.

## Inputs

- `/handoff` — comment posted, you remain the assignee or the issue
  becomes unassigned (depends on existing assignees). No reassignment
  to a specific person.
- `/handoff @<user>` — `@<user>` becomes the new assignee.
- `/handoff --reason <r> --journal <file>` — hard-stop mode, invoked
  programmatically by `/implement` or `/code-review` when a loop bound
  trips. `<r>` is one of `stuck`, `iteration-cap`, `round-trip-cap`,
  `spec-edit-detected`. `<file>` contains per-attempt signatures and the
  last gate output. The skill applies `human-review-required` and sets
  the issue to unassigned. See spec 048 §4.4.

## Workflow

### 1. Resolve PR and issue

```bash
pr=$(.claude/skills/implement/helpers/current-pr.sh)
issue=$(gh pr view "$pr" --json body --jq .body | grep -oE 'Closes #[0-9]+' | head -1 | grep -oE '[0-9]+')
```

If `Closes #N` is absent, surface the error and stop.

### 2. Gather state

```bash
.claude/skills/handoff/helpers/gather-state.sh "$pr" "$issue" > /tmp/handoff-state.json
```

The JSON is the deterministic part of the handoff: branch, last commit,
commit count, touched paths, labels.

### 3. Ask the human-judgment parts

Use `AskUserQuestion` for each, in order. Each is a single turn.

1. **Spec progress.** Pre-fill from the diff and section 5 of the spec:
   for each major file group, mark ✅ done / 🔄 in progress / ⏳ not
   started. Show the pre-fill, ask the user to accept or edit.
2. **Open decisions.** "Decisions still pending and how you were leaning?"
   (text, may be empty).
3. **Gotchas.** "Anything that bit you or would bite the next person?"
   (text, may be empty).
4. **Suggested next step.** A single line.

### 4. Compose the comment body

Use this exact shape (the marker on line 1 is what `/pickup` matches
against):

```
### 🔁 Handoff — <YYYY-MM-DD HH:MM UTC> — from @<author> to @<target-or-"unassigned">

**Branch.** <branch>

**Last commit.** <sha> <subject>

**Spec progress.**
- ✅ <item>
- 🔄 <item>
- ⏳ <item>

**Open decisions.**
- <item or "(none)">

**Gotchas.**
- <item or "(none)">

**Suggested next step.** <one-line>
```

When invoked with `--reason` and `--journal`, insert this block before
**Suggested next step**:

```
**Hard-stop journal.**
- Reason: <stuck | iteration-cap | round-trip-cap | spec-edit-detected>
- Attempts:
  - attempt 1: <12-char-signature>
  - attempt 2: <12-char-signature>
  - …
- Last gate output:
  ```
  <last 50 lines from --journal>
  ```
```

In hard-stop mode the steps in §3 are skipped (no `AskUserQuestion`
prompts). Spec progress is filled from the diff alone; Open decisions
and Gotchas default to `(none)`; Suggested next step is auto-derived
from the reason ("Reframe spec or relax bound" for `round-trip-cap`,
"Inspect last gate output and unblock the agent" for `stuck` /
`iteration-cap`, "Re-run `/spec-review`" for `spec-edit-detected`).

Save to `mktemp -t handoff-body`. The author is the current GitHub login
(`gh api user --jq .login`); the target is the `@<user>` argument (or
the literal string `unassigned`).

### 5. Post and reassign

```bash
.claude/skills/handoff/helpers/post-handoff.sh "$issue" "$body_file" "<target-or-empty>"
```

The helper posts the comment and, when the target is non-empty,
reassigns the issue.

In hard-stop mode, additionally:

```bash
.claude/skills/handoff/helpers/apply-review-label.sh "$issue"
```

The helper hard-errors if `human-review-required` does not exist in the
repo — run `setup-labels.sh` once per fork before the first hard-stop.
Target is forced to `unassigned` (the loop is asking a human, not
another contributor).

### 6. Report back

Print:

```
Issue:    <issue-url>
Comment:  <comment-url>
Assignee: @<old> → @<new-or-"unassigned">

When the new owner is ready, they run /pickup.
```

## Anti-patterns

- **Skipping the marker.** The comment must start with `### 🔁 Handoff —`
  — otherwise `/pickup` cannot find it.
- **Filling sections with "TBD".** Empty sections write `(none)`. Lazy
  TBDs lie to the next reader.
- **Long handoff comments.** The shape is small for a reason. Long
  context goes in commits, comments on commits, or the spec, not in the
  handoff.
- **Reassigning to a login that does not exist.** `gh` will error
  loudly; do not try to recover by guessing.

## Output contract

On success: a comment matching the shape exists on the issue; the
assignee has changed (or been removed). Issue URL, comment URL, and
assignee transition printed.

On failure (gh error, body file missing, target unknown): no partial
state — the comment either posted or did not. Surface stderr and stop.

## See also

- [`examples/README.md`](examples/README.md) — sample transcript.
- [`/pickup`](../pickup/SKILL.md) — the receiving side.
- [`/status`](../status/SKILL.md) — useful before `/handoff` to see
  what state you are in.
