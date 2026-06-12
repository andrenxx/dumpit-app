# Spec NNN — <Title>

| Field    | Value                                                                                |
| -------- | ------------------------------------------------------------------------------------ |
| Issue    | [#N](https://github.com/andrenx/taskdump/issues/N)                                   |
| Branch   | `feat/N-<slug>`                                                                      |
| Status   | Draft \| Under review \| Approved \| Implementing \| Shipped                         |
| Type     | feature \| chore \| bug                                                              |
| Phase    | (optional, for multi-phase initiatives)                                              |

> **How to use this template.** Copy to `docs/specs/NNN-<slug>.md` where `NNN` is the
> three-digit issue number. Keep sections short. Omit sections that do not apply,
> but make the omission intentional (a one-line "N/A — <reason>" beats deleting it
> silently). Verbose specs go unread.

## 1. Context

What problem is this solving? What is true today that motivates the change? Link to
the issue, prior discoveries, or related ADRs. **Do not** describe the solution
here — that goes in Design.

## 2. Goals

Bulleted list of outcomes this spec must achieve. Each goal should be verifiable
in the Acceptance section.

## 2.5 Validation strategy

How this spec is verified. Name the oracle, not the implementation:
behaviors checked, seams required, fixtures, UX flows. Acceptance
(section 6) should be assertions about this oracle, not a substitute
for it. If a decision here is load-bearing, lift to an ADR.

> **Numbering note.** This section is intentionally `2.5`, not `3`.
> Keeping Non-goals at section 3 (and everything after stable) avoids
> renumbering ~30 cross-references across existing specs. Future
> non-standard sections (privacy review, perf budget, etc.) follow the
> same fractional pattern. Do not "fix" this to 3.

## 3. Non-goals

Bulleted list of things explicitly **not** in scope. This is the most important
section — it is where scope creep dies.

## 4. Design

The proposed solution. Diagrams, data flow, schema changes, API shape, UI
sketches as appropriate. Subsections (4.1, 4.2, …) for distinct concerns.

If a decision in this section is load-bearing across future work, lift it into
its own ADR and reference it.

## 4.5 UX decision

> Applicable when the parent discovery had `ux: required`. If
> `ux: not-applicable`, replace the body of this section with a single
> line: `N/A — discovery marked ux: not-applicable.`

The three options surfaced in the discovery, the chosen one, and the
rationale tied to the evaluation axes. Pull the option blocks from the
discovery issue's "UX options" section verbatim; do not re-summarize.

**Options considered** (from discovery #N):

- A: <one-liner>
- B: <one-liner>
- C: <one-liner>

**Chosen**: <A | B | C>

**Rationale**: <reference the evaluation axes — implementation cost,
a11y impact, reversibility, alignment with existing flows, mobile/PWA
fit. Cite the trade-off that broke the tie.>

**New tone-matrix rows proposed** (optional): if the option introduces
copy in a context not yet listed in
[`docs/ux/voice-and-tone.md`](../ux/voice-and-tone.md), propose the
row(s) here. On `/ship`, promote reusable rows to the matrix.

| Contexto | Tom | Exemplo |
| -------- | --- | ------- |
|          |     |         |

> **Promotion to ADR.** A UX decision becomes an ADR only when it
> creates a project-wide constraint (e.g., "every destructive action
> uses pattern X"). One-feature decisions stay here.

## 5. Files

Table of files created, modified, or deleted. Helps reviewers navigate the PR
and helps the implementer not forget anything.

| Path | Action | Notes |
| ---- | ------ | ----- |
|      |        |       |

## 6. Acceptance

Checklist of conditions that must be true for this spec to be considered shipped.
Each item should be objectively verifiable (a person can say yes/no without
debate).

- [ ] …

## 7. Risks

Known risks and their mitigations. Be honest — "this might be premature" or
"we are not sure X will work" belongs here.

| Risk | Mitigation |
| ---- | ---------- |
|      |            |

## 8. Rollout

How this lands. Single PR? Phased? Behind a flag? What happens after merge —
docs to update, follow-up issues to open, communications to send.

---

**Reviewer checklist:**

- Goals are achievable inside this PR.
- Non-goals are explicit; nothing snuck in.
- File list is complete.
- Acceptance criteria are objective.
