# Spec reviewer checklist

This is the canonical checklist used by `/spec-review`. Edit here, not in
the skill workflow — `SKILL.md` reads this file at runtime.

## Items

For every item: respond **pass**, **concern**, or **blocker**, with a
one-line justification quoting the spec when applicable.

### 1. Goals are achievable inside this PR

Goals listed in section 2 must be deliverable in the single PR this spec
governs. If a goal would require its own future spec to fully meet,
that is a **blocker**.

### 2. Non-goals are explicit and disciplined

Section 3 must enumerate what is out of scope. Empty or vague non-goals
("nothing else") are a **concern**. A non-goal contradicting an item that
appears in Goals or Design is a **blocker**.

### 3. Design is grounded, not a placeholder

Section 4 must propose a concrete approach with sub-sections. "TBD" or
copy-pasted template prompts are a **blocker**. When the agent is uncertain,
the Alternatives sub-section should be present (or `--options` should be
mentioned in the rollout).

### 4. Files list matches the Design

Every file claimed in section 4 should appear in section 5 (or be
explicitly out of scope). A Design that touches files not listed in 5 is
a **concern**; a Files list mentioning paths the Design never references
is a **blocker** (dead intent).

### 5. Acceptance criteria are objective

Section 6 must list criteria a reviewer can mark yes/no without debate.
"Tests pass" without specifying coverage targets is a **concern** (unless
the project has none). "Looks good" or "feels right" is a **blocker**.

### 6. Risks are honest

Section 7 must include real risks with real mitigations. Boilerplate
("might have bugs") is a **concern**. Zero risks listed for a non-trivial
spec is a **blocker** — every change has trade-offs.

### 7. Rollout is concrete

Section 8 must describe how the change lands: commits planned, dry run,
flags, follow-ups. Hand-waving is a **concern**.

### 8. Single-branch / single-PR fit — superseded

Replaced by item 12 (Decomposition analysis). This number is preserved
so existing audit transcripts referencing item 8 still parse; report
**pass** with `superseded by 12`.

### 9. Internal consistency

Cross-references inside the spec (e.g., "see 4.7", "as defined in 4.4")
must resolve to the named section. Broken refs are a **concern**.

### 10. Validation strategy is executable

Section 2.5 must name a concrete oracle a verifying agent could execute
without further interpretation. "Tests for X behavior" is too vague and
is a **concern**; "POST /x with payload Y produces Z observable in W"
passes. A missing or empty 2.5 is a **blocker** for specs opened after
the validation-shift-left landed; older specs are grandfathered.

### 11. No leakage from out-of-scope phases

Multi-phase specs must not pull work from later phases into the current
PR's section 5 (Files). Leakage is a **blocker**.

### 12. Decomposition analysis

Decide whether the spec is one job-to-be-done or several independent
flows. The decision drives a single verdict the audit must emit on a
stable marker line (see "Verdict marker line" below).

Identify candidate **chunks** by inspection of section 5 (Files) and
section 4 (Design). A chunk is a logical group of files implementing
one observable outcome. Most specs surface 1–4 candidates naturally;
a single-chunk spec is a single job.

For each pair of candidate chunks (A, B), answer four operational
tests:

1. **Parallelism.** Could two autonomous agents work on A and B
   simultaneously without merge conflicts on the same files?
2. **Runtime isolation.** Does B depend on a contract A exposes
   (function signature, schema, file path, label name)? If yes,
   sequential. If no, candidate for parallel.
3. **Ship isolation.** Could A be merged and shipped while B is
   still in progress, with the system staying coherent (no broken
   builds, no half-feature in production)?
4. **Test isolation.** Are the tests for A and B independent (no
   shared fixtures whose change would couple them)?

Map the answers to one of three verdicts:

- **`single`** — there is one chunk, or the chunks fail at least two
  isolation tests. The spec is one job-to-be-done. Recommend an
  incremental commit plan inside the single PR. Report **pass**.
- **`decompose`** — there are 2+ chunks and they pass at least 3 of
  the 4 isolation tests. List each chunk with a one-line scope.
  Report **pass**; the skill applies `spec:requires-decomposition`
  to the PR after the audit.
- **`rescope`** — single chunk (one job), but the reviewer judges
  the PR will be unreviewable at this size (qualitative — no
  numeric threshold). Decomposing would create incoherent PRs;
  rescoping the discovery or spec produces a smaller atomic job.
  Recommend rerunning `/spec` (or `/discover`) with narrower
  framing. Report **blocker**: spec cannot receive `spec:approved`
  until rescoped.

`rescope` requires the audit to justify why decomposition would
fragment one job; absent that justification, the verdict is
`decompose`. Try decomposition first.

**Verdict marker line.** The audit body must contain exactly one
line matching:

```
**Decomposition verdict:** <single | decompose | rescope>
```

Followed by a short justification paragraph and, on `decompose`,
a fenced block listing the chunks (consumed by `/decompose`):

````
```chunks
- <chunk-1-title>: <one-line scope>
- <chunk-2-title>: <one-line scope>
```
````

Numeric size thresholds (Goals, Files, Design sub-sections) are not
used. The four operational tests replace them.

## Output format

The skill reports the audit in three groups:

```
✅ Pass
- 1. Goals are achievable inside this PR — Goals 1-4 each map to a single helper or section.
- 2. Non-goals are explicit and disciplined — section 3 enumerates 6 non-goals.
- ...

⚠️ Concerns
- 7. Rollout is concrete — section 8 step 4 says "address findings" without listing what counts as a finding.

❌ Blockers
- (none)
```

When there are no items in a group, write `(none)`.
