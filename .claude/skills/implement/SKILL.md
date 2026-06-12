---
name: implement
description: Drive implementation against an approved spec. Reads the spec's Files and Design, runs sanity gates from package.json before each commit, commits incrementally, transitions the issue label to phase:implementing.
---

# /implement

> **Root anchoring.** All paths in this skill are root-relative. Before any
> file operation, ensure cwd is the repo root
> (`cd "$(git rev-parse --show-toplevel)"`).

## When to use

A feature PR exists, the spec is `spec:approved`, and the work has not
started. The issue is in `phase:spec`.

Skip this skill when:
- The PR has no `spec:approved` label (run `/spec-review` first).
- You're fixing a typo or doing trivial work that does not need spec
  ceremony (use the manual flow).

## Inputs

- `/implement` — uses the current branch's PR.
- `/implement <pr-number>` — explicit PR.

## Workflow

### 1. Resolve PR and spec

```bash
pr=${1:-$(.claude/skills/implement/helpers/current-pr.sh)}
spec_path=$(.claude/skills/spec-review/helpers/load-spec.sh "$pr")
issue=$(gh pr view "$pr" --json body --jq .body | grep -oE 'Closes #[0-9]+' | head -1 | grep -oE '[0-9]+')
```

If the issue cannot be derived from the PR body (no `Closes #N`),
surface the error and stop — every PR opened by `/spec` includes that
line.

### 2. Gate on `spec:approved`

```bash
.claude/skills/implement/helpers/verify-spec-approved.sh "$pr"
```

If the helper exits non-zero, surface stderr and stop.

### 3. Transition the issue label

```bash
.claude/skills/_shared/helpers/transition-issue-label.sh "$issue" phase:spec phase:implementing
```

The transition is adjacent-only; the helper refuses anything else.

### 4. Plan chunks from the spec

Read sections 4 (Design) and 5 (Files) of the spec. Group files into
logical commit chunks. Examples of a good chunk:
- "all helpers for one skill"
- "the SKILL.md plus its examples"
- "shared helpers"

Avoid:
- Mega-commits ("everything except docs").
- Sub-file commits (one helper per commit is overkill).

### 4.5 Bounds (read once at start)

```bash
eval "$(.claude/skills/implement/helpers/check-bounds.sh "$pr")"
# exports: max_iterations, max_round_trips, round_trip
```

If the helper exits non-zero, the round-trip cap was already hit before
this run started. Hard-stop immediately per §5b — do not begin a chunk.

### 4.6 Acquire the implement lock (spec 049)

Before any chunk runs, acquire the guard lock. The lock activates the
`PreToolUse` hook in `.claude/settings.json` so Edit/Write/MultiEdit
calls outside the spec's §5 Files list (or to `docs/specs/*`) are
blocked at policy level, not just convention.

```bash
.claude/skills/implement/helpers/acquire-lock.sh "$spec_path"
trap '.claude/skills/implement/helpers/release-lock.sh' EXIT
```

A stale lock pointing at the same spec is overwritten with a warning;
a stale lock pointing at a different spec is a hard-error — resolve
manually before continuing. Hard-stop in §5b also calls
`release-lock.sh` before invoking `/handoff`, so the handoff
machinery's own edits are not blocked.

`max_iterations = 5` is the per-invocation cap on retries (across all
chunks combined). `max_round_trips = 3` is the cap on
`/implement` ↔ `/code-review` cycles. `stuck_window = 2` is the
consecutive-identical-signature threshold for stuck detection. These
are constants in the helpers per spec 048 §4.5.

### 5. For each chunk — bounded inner loop

The loop has explicit bounds (per spec 048 §4.3):

```
attempts=()
for i in 1..max_iterations:
    implement_or_fix(chunk)
    if run-sanity-gates.sh passes:
        git commit -m "<type>(#N): <message>"
        break
    sig=$(failure-signature.sh <gate-name> < gate.stderr)
    attempts+=("$sig")
    git commit -m "wip(#N): attempt $i — $sig"
    if stuck.sh --window 2 "${attempts[@]}"; then
        hard-stop "stuck — signature $sig repeated"
    fi
    if [[ $i -eq max_iterations ]]; then
        hard-stop "iteration cap"
    fi
push
```

Per-step rules:

- **Implement the code.** Follow the Design literally; if reality forces
  a deviation, edit the spec in the same commit and call it out in the
  commit message. (`/code-review` will detect the spec edit and
  invalidate `spec:approved`.)
- **Sanity gates** (`run-sanity-gates.sh`): hard error when no gates are
  declared in `package.json`. On gate failure, do **not** retry blindly;
  follow the bounded loop above.
- **Stage explicitly.** `git add <specific-paths>`. Never `-A`.
- **Commit messages:**
  - Successful attempt: `<type>(#<N>): <message>` (the work commit).
  - Failed attempt: `wip(#<N>): attempt <i> — <12-char-signature>`.
    Examples in [`examples/README.md`](examples/README.md).
- **Iteration counter is per-invocation, across all chunks**, not
  per-chunk. A `/implement` invocation that consumes 5 attempts on
  chunk 1 hard-stops without starting chunk 2.

### 5b. Hard-stop

When a bound trips:

1. Release the implement lock so the handoff machinery's own edits
   are not blocked: `.claude/skills/implement/helpers/release-lock.sh`.
2. Write a journal payload to a tmp file. One line per attempt:
   `attempt <i>: <signature>` plus the last gate's stderr (last 50
   lines) at the bottom under `--- last gate output ---`.
3. Invoke `/handoff --reason <iteration-cap|stuck|round-trip-cap> --journal <tmp-file>`.
   The handoff applies `human-review-required` and posts the structured
   comment.
4. Exit the skill. Do not attempt further chunks.

### 6. Push at the end of each chunk

`git push`. Pushing inside a chunk is fine if you need a checkpoint, but
the bare-minimum cadence is once per chunk so partial state reaches
origin and is visible to the other reviewer.

### 7. Report back

Print:

```
Issue:   <issue-url> (now phase:implementing)
PR:      <pr-url>
Branch:  <branch>
Commits: <chunk-1-msg>
         <chunk-2-msg>
         ...

Next step: run /code-review when implementation feels done.
```

## Anti-patterns

- **Implementing past the spec.** If the work needs files not in section
  5, stop, edit the spec, accept that `spec:approved` will be invalidated.
- **Re-trying past `max_iterations` or ignoring stuck signal.** Bounds
  are non-negotiable; a hard-stop is preferable to one more attempt
  (ADR 0003 principle 1). Tune the constant in `check-bounds.sh` if it
  is genuinely wrong, do not bypass it.
- **`git add -A`.** Picks up local junk (logs, scratch files,
  `.DS_Store`).
- **Skipping sanity gates.** They are cheap; they catch real bugs;
  contributors who skip them will be caught by `/code-review` anyway.
- **Marking the PR ready.** That's `/ship`'s job.
- **Single mega-commit at the end.** Defeats the value of incremental
  review.

## Output contract

On success: code on the branch matching the spec, `spec:approved` still
present (assuming spec was not edited), issue at `phase:implementing`,
PR still draft.

On failure (gate fails, spec untouched): the failed gate's output is
visible; no commit was made; the contributor fixes and retries.

## See also

- [`examples/README.md`](examples/README.md) — sample transcript.
- [`/code-review`](../code-review/SKILL.md) — next step after this skill.
- [`/spec-review`](../spec-review/SKILL.md) — required upstream gate.
