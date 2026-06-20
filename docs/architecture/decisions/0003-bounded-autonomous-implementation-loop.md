# ADR 0003 — Bounded autonomous implementation loop

| Field  | Value      |
| ------ | ---------- |
| Status | Accepted   |
| Date   | 2026-06-18 |

## Context

DumpIt operates a spec-driven workflow with skills covering each phase
(`/discover`, `/discovery-review`, `/spec`, `/spec-review`,
`/implement`, `/code-review`, `/ship`, `/handoff`, `/pickup`). The
stated direction is autonomous agent implementation: an agent reads a
spec, implements against it, runs the sanity gates, fixes failures,
and either reaches a green state ready for review or hands off to a
human.

This loop has three failure modes that, left implicit, produce either
infinite churn or silent acceptance of broken work:

- **Stuck on the same failure.** The agent retries with the same
  outcome. Detectable: failure signature does not change across
  iterations.
- **Non-monotonic progress.** Each fix breaks something new; total
  red surface does not shrink.
- **Spec ambiguity or error.** The implementation target is itself
  wrong. Detectable: the agent attempts to edit the spec, or the same
  correct implementation maps to contradictory acceptance criteria.

A separate failure mode, present from the moment automation entered
the workflow: **the agent both implements the code and authors the
tests**. Confirmation bias is then unbounded — tests are shaped to
pass the code that was just written, not to verify the behavior the
spec promised.

## Decision

We adopt four principles for autonomous agent loops in this project:

1. **Bounded loops with explicit hard-stops.** Agent loops operate
   within declared bounds — maximum iterations within a single skill
   invocation, maximum round-trips between `/implement` and
   `/code-review`, and detectors for stuck-state (repeated failure
   signature). When a bound is hit or a detector fires, the agent
   stops and hands off; it does not attempt one more time.
   Hard-stops are preferable to additional attempts. Specific numeric
   thresholds are decided at the spec level, not here.

2. **Hard-stops produce machine-readable handoffs.** When the loop
   stops, the agent applies a `human-review-required` label to the
   issue and invokes `/handoff` to write a structured journal of what
   was tried, what failed, and why the loop exited. Both are
   mandatory — neither alone is sufficient.

3. **Iterative state lives in the branch's git history.** Each
   iteration of the inner loop produces a commit (e.g.
   `wip(#N): attempt M — <signature>`) so progress is observable
   from the PR while it is open. `/ship` squash-merges so `main`
   stays clean. No parallel state store is introduced — the branch
   history is the journal.

4. **Validation thinking shifts left.** How a change is verified is
   settled before the change is implemented, not by the implementer.
   `/discover` asks how we would know the pain is resolved.
   `/spec` records the validation strategy — the oracle: what
   behaviors are verified, what seams must exist, what fixtures, what
   UX flows — as a first-class section. `/spec-review` verifies the
   validation strategy is executable. `/implement` and `/code-review`
   honor that contract; the implementer does not author the oracle.

## Consequences

**Easier:**

- Agent loops have a stable mental model: bounded, observable, with a
  defined exit. Reasoning about "what happens when it gets stuck" no
  longer requires reading the code of every skill.
- PRs are observable in flight — a reviewer scrolling a PR's commits
  sees the agent's path, including its dead ends.
- The validation contract is set before code is written, removing the
  largest source of confirmation bias in agent-authored test suites.

**Harder:**

- Every skill that runs an agent loop (`/implement`, `/code-review`)
  inherits this responsibility. Skills that ignore bounds drift out
  of compliance.
- `/discover` and `/spec` become heavier upstream. A discovery without
  a validation signal, or a spec without a validation strategy
  section, cannot proceed cleanly. We accept this cost as the price
  of avoiding bias downstream.
- PR histories include WIP commits during development. This is
  intentional — the cost is paid by reviewers scrolling, not by
  `main`, which the squash erases.

**Reversal:**

- Reversal of principles 1–2 (bounds and handoffs) is reasonable only
  if the loop's failure modes turn out to be theoretical in practice.
  Collect evidence before reversing.
- Reversal of principle 4 (validation shifts left) is not reasonable
  without abandoning autonomous implementation. Allowing the
  implementer to author the oracle is the failure mode this principle
  exists to prevent.
