---
name: discovery-review
description: Fresh-context audit of a phase:discovery issue against framing, UX-scope, and product-direction (vision, personas, pricing, competitors). Strict binary severity — pass or blocker, no concerns. Applies phase:discovery-reviewed on a clean pass; refuses on any blocker. Required gate before /spec.
---

# /discovery-review

## When to use

A `phase:discovery` issue exists and the human (or agent) wants to
promote it to a spec. `/spec` will refuse to promote any discovery
that does not carry the `phase:discovery-reviewed` label, so this
skill is the gate that produces it.

Run after `/discover` and before `/spec`. Re-run on the same issue
after edits — the helpers are idempotent.

## Inputs

- `/discovery-review <issue-number>` — explicit form. Required.

There is no "current branch" form. At this stage no branch exists
yet (branches are created by `/spec`), so the issue number is the
only join key.

## Workflow

### 1. Load the discovery

```bash
discovery_path=$(.claude/skills/discovery-review/helpers/load-discovery.sh <N>)
```

The helper writes the issue title, body, and label list to a tmp file
and returns the path. It refuses if the issue is not in
`phase:discovery` (or `phase:discovery-reviewed` for re-runs).

### 2. Fresh-context audit

Spawn an `Explore` subagent (or `general-purpose`) with a prompt that
names exactly these inputs:

- The discovery tmp file at `$discovery_path`.
- The checklist at
  `.claude/skills/discovery-review/helpers/checklist.md`.
- The four product-direction files: `docs/business/vision.md`,
  `docs/business/personas.md`, `docs/business/pricing.md`,
  `docs/business/competitors.md`.

Prompt the subagent:

> "Audit the discovery at <discovery-path> against every item in
> <checklist>. Read the discovery's `type:*` label first — it
> determines the applicability of items 5–8 per the checklist's
> 'Applicability by type label' section. For each item, report
> **pass**, **blocker**, or — only for items 5–8 on `type:chore`
> discoveries — `N/A — non-functional` (counted as pass), with a
> one-line justification quoting the discovery or the relevant
> `docs/business/` file. Output in the two-section format the
> checklist describes (`✅ Pass` and `❌ Blockers`); list `N/A`
> items under `✅ Pass` with the `N/A — non-functional` marker. Use
> `(none)` when a section is empty. Do not propose fixes; the human
> owns that. Severity is never the escape hatch — if you are tempted
> to call something a 'concern', call it a blocker."

Receive the structured report.

### 3. Display the report

Print the two sections verbatim with the headings `✅ Pass` and
`❌ Blockers`. Use `(none)` when a section is empty so the absence is
explicit. There is no `⚠️ Concerns` section — the absence is
deliberate.

### 4. Decide whether to ask about the label

| State         | Action                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------- |
| 0 blockers    | Ask via `AskUserQuestion`: "All checks passed. Apply `phase:discovery-reviewed` label?" Default: yes. |
| ≥ 1 blocker   | Do **not** ask. Print: "Address blockers, then run `/discovery-review <N>` again." Stop.            |

### 5. Apply the label on confirmation

If the user confirms, derive a one-line summary from the audit (e.g.,
`"9/9 pass, 0 blockers"`) and run:

```bash
.claude/skills/discovery-review/helpers/apply-discovery-reviewed.sh <N> "<summary>"
```

The helper adds the `phase:discovery-reviewed` label and posts a
single PR/issue comment. Both operations are idempotent.

### 6. Report back

Print:

```
phase:discovery-reviewed applied to issue #<N>: <issue-url>
Next step: run /spec <N> to convert this discovery into a feature spec.
```

## Anti-patterns

- **Treating an audit finding as a "concern" to defer.** This skill
  is intentionally binary. If a finding is real, it is a blocker —
  resolve by editing the discovery (or, in genuine pivots,
  `docs/business/`). Severity is never the escape hatch.
- **Auditing in the same context that wrote the discovery.** Defeats
  the fresh-eyes purpose. Always spawn a subagent.
- **Skipping the label and proceeding to `/spec` anyway.** `/spec`
  will refuse — there is no override flag. The label is the only
  signal it accepts.
- **Adding checklist items at runtime.** The checklist is canonical;
  propose changes via a separate spec, not inline during a review.
- **Approving on the human's behalf.** Always wait for confirmation,
  even on clean passes (the `AskUserQuestion` step is mandatory).

## Output contract

On clean pass with confirmation: the issue carries
`phase:discovery-reviewed` and a marker comment summarizing the
audit.

On any blocker: report shown, no label change, no comment, no
further action — the human addresses the discovery (or
`docs/business/`) and re-runs.

On user declining the label: report shown, no label change. The
human can re-run later.

## See also

- [`examples/README.md`](examples/README.md) — sample transcripts.
- [`helpers/checklist.md`](helpers/checklist.md) — the canonical checklist.
- [`/discover`](../discover/SKILL.md) — upstream framing skill.
- [`/spec`](../spec/SKILL.md) — downstream skill, gated on this label.
