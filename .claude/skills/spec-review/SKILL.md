---
name: spec-review
description: Fresh-context audit of a spec PR against the project's reviewer checklist. Reports pass / concerns / blockers, and on a clean pass asks for confirmation to apply the spec:approved label. Never approves silently.
---

# /spec-review

## When to use

A spec PR exists (typically opened by `/spec`) and the human wants a
fresh-eyes audit before approving. Run after the spec has been drafted and
edited to your satisfaction; the audit treats the spec as if you are seeing
it for the first time.

## Inputs

- `/spec-review <pr-number>` — explicit PR.
- `/spec-review` — uses the current branch's open PR.

## Workflow

### 1. Resolve the spec file

```bash
spec_path=$(.claude/skills/spec-review/helpers/load-spec.sh [<pr-number>])
```

The helper returns the absolute path to the single spec file touched in
the PR. If zero or multiple specs are touched, surface the helper's stderr
and stop — `/spec-review` audits one spec at a time.

### 2. Resolve the PR number

If the user did not pass `<pr-number>`, derive it from the current branch:

```bash
pr=$(gh pr view --json number --jq .number)
```

### 3. Fresh-context audit

Spawn an Explore subagent (or general-purpose) to read **only** these
inputs:

- The spec file at `$spec_path`.
- The linked GitHub issue body (`gh issue view <N> --json title,body,labels`).
- The checklist at `.claude/skills/spec-review/helpers/checklist.md`.

Prompt the subagent:

> "Audit the spec at <path> against every item in <checklist>. For each
> checklist item, report **pass**, **concern**, or **blocker**, with a
> one-line justification quoting the spec when applicable. Output in the
> three-section format the checklist describes. Do not propose fixes; the
> human owns that.
>
> For checklist item 12 (Decomposition analysis), apply the four
> operational tests on candidate chunks identified from sections 4
> and 5, then emit exactly one verdict marker line in the audit body:
> `**Decomposition verdict:** <single | decompose | rescope>`. On
> `decompose`, follow the marker line with a fenced ` ```chunks `
> block listing each chunk and its one-line scope (consumed by
> `/decompose`). On `rescope`, the verdict is a blocker and the
> justification must explain why decomposition would fragment one
> job. Numeric size thresholds are not used.
>
> Item 8 is superseded by item 12; report **pass** with `superseded
> by 12`."

Receive the structured report.

### 4. Display the report

Print the three sections to the user verbatim, with the headings
`✅ Pass`, `⚠️ Concerns`, `❌ Blockers`. When a section is empty, include
`(none)` so the absence is explicit.

### 5. Decide whether to ask about the label

| State                     | Action                                                            |
| ------------------------- | ----------------------------------------------------------------- |
| 0 blockers, 0 concerns    | Ask via `AskUserQuestion`: "All checks passed. Apply `spec:approved` label?" Default: yes. |
| 0 blockers, ≥ 1 concern   | Ask via `AskUserQuestion`: "Concerns above are non-blocking. Apply `spec:approved` despite them, or address first?" Default: no. |
| ≥ 1 blocker               | Do **not** ask. Print: "Address blockers, then run `/spec-review` again." Stop. |

### 6. Apply the label on confirmation

If the user confirms, derive a one-line summary from the audit (e.g.,
"7/10 pass, 3/10 concerns acknowledged, 0 blockers") and run:

```bash
.claude/skills/spec-review/helpers/apply-spec-approved.sh <pr-number> "<summary>"
```

The helper adds the `spec:approved` label and posts a PR comment with the
summary. Both operations are idempotent.

### 6.5 Apply decomposition label when verdict is `decompose`

After applying `spec:approved` (or unconditionally on a clean
audit), inspect the verdict marker line from item 12:

- `single` — no further label action.
- `decompose` — run:
  ```bash
  .claude/skills/spec-review/helpers/apply-decomposition-label.sh <pr-number> "<one-line chunk summary>"
  ```
  This adds `spec:requires-decomposition` (idempotent) and posts a
  comment that points the human at `/decompose`. `/decompose`
  refuses to run without this label.
- `rescope` — already a blocker (step 5 stopped). No label.

### 7. Report back

Print:

```
spec:approved label applied to PR #<N>: <pr-url>
[on decompose verdict:]
spec:requires-decomposition label applied — run /decompose <N> to open child issues.
[on single verdict:]
Next step: implement on the same branch, then run /code-review.
```

## Anti-patterns

- **Approving via `gh pr review --approve`.** That is reserved for code
  review. `spec:approved` is the project's signal for the spec pass.
- **Asking about the label when blockers exist.** Don't.
- **Auditing in the same context that wrote the spec.** Defeats the
  fresh-eyes purpose. Always spawn a subagent.
- **Adding checklist items the spec template does not specify.** The
  checklist is canonical; propose changes to it via a separate spec, not
  inline during a review.
- **Approving on the human's behalf.** Always wait for confirmation, even
  on clean passes (the `AskUserQuestion` step is mandatory).

## Output contract

On clean pass with confirmation: PR carries `spec:approved` label and a
PR comment summarizing the audit.

On any blocker: report shown, no label change, no comment, no further
action — the human addresses and re-runs.

On user declining the label: report shown, no label change. The human can
re-run later.

## See also

- [`examples/README.md`](examples/README.md) — sample transcript.
- [`helpers/checklist.md`](helpers/checklist.md) — the canonical checklist.
- [`/spec`](../spec/SKILL.md) — produces the spec PR this skill audits.
