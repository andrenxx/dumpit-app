---
name: code-review
description: Fresh-context audit of the diff against the spec. Detects spec edits and invalidates spec:approved. On a clean code-review pass, asks to apply code:approved. Never approves silently.
---

# /code-review

> **Root anchoring.** All paths in this skill are root-relative. Before any
> file operation, ensure cwd is the repo root
> (`cd "$(git rev-parse --show-toplevel)"`).

## When to use

Implementation feels done; the contributor is ready to ship. The PR is
still draft; the issue is at `phase:implementing`.

Skip when blockers from the previous run still need addressing — fix
them and re-run.

## Inputs

- `/code-review` — uses the current branch's PR.
- `/code-review <pr-number>` — explicit PR.

## Workflow

### 1. Resolve PR and spec

```bash
pr=${1:-$(.claude/skills/implement/helpers/current-pr.sh)}
spec_path=$(.claude/skills/spec-review/helpers/load-spec.sh "$pr")
issue=$(gh pr view "$pr" --json body --jq .body | grep -oE 'Closes #[0-9]+' | head -1 | grep -oE '[0-9]+')
```

### 2. Detect spec edits since `spec:approved`

```bash
touched=$(.claude/skills/code-review/helpers/check-spec-touched.sh "$pr" "$spec_path")
```

If `$touched` is non-empty:

1. Run the invalidator (loose semantics from spec 017 §4.5):
   ```bash
   .claude/skills/spec-review/helpers/invalidate-spec-approval.sh "$pr" "$spec_path"
   ```
2. Print:
   > "⚠️ Spec was edited after approval; `spec:approved` removed.
   > Code review continues against the current spec; run `/spec-review`
   > before `/ship` to re-approve."
3. **Continue** with the audit. `/ship` will refuse to merge until
   `/spec-review` re-applies `spec:approved`, so the gate is preserved
   without forcing an immediate re-review.

### 3. Fresh-context audit

Spawn an Explore subagent (or general-purpose) with these inputs only:

- The spec file at `$spec_path`.
- The PR diff: `gh pr diff <pr>`.
- The reviewer checklist at
  `.claude/skills/code-review/helpers/checklist.md`.

Prompt the subagent:

> "Audit the diff against the spec, applying every item in the
> checklist. Report `pass`, `concern`, or `blocker` per item with a
> one-line justification quoting the spec or the diff. Do not propose
> fixes; the human owns that. Use the three-section format the
> checklist describes."

### 4. Display the report

Print the three sections (`✅ Pass`, `⚠️ Concerns`, `❌ Blockers`)
verbatim. Empty sections show `(none)`.

### 5. Decide whether to ask about the label

| State                      | Action                                                                     |
| -------------------------- | -------------------------------------------------------------------------- |
| 0 blockers, 0 concerns     | Ask via `AskUserQuestion`: "All checks passed. Apply `code:approved`?" Default: yes. |
| 0 blockers, ≥ 1 concern    | Ask: "Concerns above are non-blocking. Apply `code:approved` despite them, or address first?" Default: no. |
| ≥ 1 blocker                | Bump the round-trip counter (§5a) and either return-to-implement or hard-stop. |

### 5a. Round-trip bump (when blockers ≥ 1)

```bash
fp=$(printf '%s\n' "$blocker_titles_sorted_lowercased" | shasum -a 1 | cut -c1-12)
new=$(.claude/skills/code-review/helpers/round-trip.sh bump "$pr" "$fp")
```

`round-trip.sh` is idempotent: re-running `/code-review` against the
same blockers (same fingerprint) does not double-count.

If `new >= max_round_trips` (3 per spec 048 §4.5), this is the round-trip
cap. **Hard-stop:** invoke
`/handoff --reason round-trip-cap --journal <tmp>` and stop. Do not
print "address blockers, run again" — the loop is exhausted; the human
must reframe the spec.

If `new < max_round_trips`, print: "Address blockers, then run
`/code-review` again." Stop.

### 6. Apply the label on confirmation

```bash
.claude/skills/code-review/helpers/apply-code-approved.sh <pr> "<summary>"
```

The helper adds `code:approved` and posts a PR comment with the
summary. Both operations are idempotent and use the heredoc body
form fixed in #12.

### 7. Transition the issue label

Whether or not the user applied `code:approved`, the audit ran. Move
the issue forward:

```bash
.claude/skills/_shared/helpers/transition-issue-label.sh "$issue" phase:implementing phase:review
```

The transition is adjacent-only. If the issue is already at
`phase:review` (re-running the skill), the helper refuses with a
"already there" message — that is fine, treat it as a no-op.

### 8. Report back

Print:

```
PR:    <pr-url>  (code:approved label: <yes|no>; spec:approved invalidated: <yes|no>)
Issue: <issue-url>  (now phase:review)

Next step: run /spec-review (if spec:approved was invalidated) and then /ship.
```

## Anti-patterns

- **Approving via `gh pr review --approve`.** That is a separate signal
  that GitHub records on its own; the project's `code:approved` label
  is what `/ship` reads.
- **Reviewing in the same context that wrote the code.** Always spawn
  a subagent for the audit.
- **Asking about the label when blockers exist.** Don't.
- **Refusing to continue when the spec was touched.** Loose semantics:
  warn, invalidate, continue. The user picks the moment to re-review
  the spec.
- **Auto-applying `code:approved` without confirmation.** Even on clean
  passes, the `AskUserQuestion` step is mandatory.

## Output contract

On a clean pass with confirmation: `code:approved` label present, audit
summary in PR comments, issue at `phase:review`.

On any blocker: report shown, no label change, no comment, audit will
re-run after the contributor addresses.

On declined label: report shown, no label change, issue still
transitions to `phase:review`.

## See also

- [`examples/README.md`](examples/README.md) — sample transcript.
- [`helpers/checklist.md`](helpers/checklist.md) — canonical checklist.
- [`/implement`](../implement/SKILL.md) — upstream skill.
- [`/ship`](../ship/SKILL.md) — downstream skill (requires `code:approved`).
- [`/spec-review`](../spec-review/SKILL.md) — required again if the
  spec was edited.
