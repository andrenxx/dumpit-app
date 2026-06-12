# Discovery reviewer checklist

This is the canonical checklist used by `/discovery-review`. Edit
here, not in the skill workflow — `SKILL.md` reads this file at
runtime.

## Severity model

**Every item is binary: pass or blocker.** There is no "concern" or
"warning" bucket. Discovery is the cheapest stage to catch drift; if
a finding is worth noting, it is worth resolving before promotion.

The escape hatch for a blocker you disagree with is the **artefact**:
edit the discovery, or — if the misalignment reflects a deliberate
strategy shift — edit `docs/business/` first via its own PR. Severity
is never the escape hatch.

## Applicability by type label

Discoveries split into two classes by their `type:` label:

- **Product-facing** (`type:feature` or `type:bug`): every item 1–9
  applies as written. These discoveries change what the user
  experiences, so alignment with `docs/business/` is load-bearing.
- **Non-functional** (`type:chore`): items 1–4 and 9 apply as
  written; items 5–8 (vision / personas / pricing / competitors) are
  marked **N/A — non-functional** and pass automatically. Harness,
  tooling, infrastructure, internal-process, and skill changes do
  not move the product on `docs/business/` axes; auditing them
  against those files would block on a category mismatch, not a
  real drift.

Discoveries without a `type:*` label → **blocker** on item 0
(below). Resolve by adding the label, then re-run.

## Items

For every item: respond **pass** or **blocker** with a one-line
justification quoting the discovery or the relevant `docs/business/`
file. For items 5–8 on `type:chore` discoveries, respond `N/A —
non-functional` (counted as pass).

### 0. Type label is set

The discovery must carry exactly one `type:*` label
(`type:feature`, `type:bug`, or `type:chore`). The label drives the
applicability of items 5–8 and the downstream branch type. Missing
or multiple `type:*` labels → **blocker**.

## Items

For every item: respond **pass** or **blocker** with a one-line
justification quoting the discovery or the relevant `docs/business/`
file.

### 1. Problem statement is concrete, not solution-shaped

Discovery anti-pattern is naming the solution in the title or body.
Title or body that names a solution instead of the pain → **blocker**.
Body without a concrete recent example or without an observable
resolution signal → **blocker**.

### 2. "Why now" is non-empty and traceable

Empty or boilerplate ("would be nice", "we should probably") →
**blocker**. The discovery must name a consequence of inaction or a
specific stakeholder feeling the pain.

### 3. Validation signal is observable, not feature-shaped

The "How would we know this is resolved?" section must name an
observable behavior, not a deliverable. Missing, empty, or
feature-shaped ("ship the queue") → **blocker**.

### 4. UX cross-check

Read the body for UI signals — screens, copy, flows, components,
"dashboard", "button", "modal", references to the user *seeing*
something. Mismatch in either direction → **blocker**:

- `ux: not-applicable` set, but UI signals are present in the body.
- `ux: required` set, but no UI signals are present.

### 5. Vision alignment

`type:chore` → `N/A — non-functional`.

For `type:feature` / `type:bug`: cross-reference
`docs/business/vision.md`. Discovery clearly outside the stated
product mission → **blocker**. Genuine pivots edit `vision.md` first
via its own PR, then re-run `/discovery-review`.

### 6. Persona alignment

`type:chore` → `N/A — non-functional`.

For `type:feature` / `type:bug`: cross-reference
`docs/business/personas.md`. Discovery whose user is not a listed
persona → **blocker**. New personas are added to `personas.md` first
via their own PR.

### 7. Pricing alignment

`type:chore` → `N/A — non-functional`.

For `type:feature` / `type:bug`: cross-reference
`docs/business/pricing.md`. Discovery whose value prop sits on the
wrong side of the pricing model — for example, a free-tier feature
only the paid tier supports — → **blocker**.

### 8. Competitor positioning

`type:chore` → `N/A — non-functional`.

For `type:feature` / `type:bug`: cross-reference
`docs/business/competitors.md`. Discovery duplicating a commodity
feature without differentiation → **blocker**.

### 9. Recommended next step is honest

"Open feature issue and run `/spec`" with items 1–4 unsatisfied →
**blocker**. "Wait/observe" without a body line explaining what would
change the recommendation → **blocker**.

## Output format

The skill reports the audit in two groups:

```
✅ Pass
- 1. Problem statement is concrete — body opens with a recent example
  ("dashboard upload state on 2026-04-21").
- 2. Why now — names spec 038 as the load-bearing trigger.
- ...

❌ Blockers
- (none)
```

When there are no items in a group, write `(none)`.
