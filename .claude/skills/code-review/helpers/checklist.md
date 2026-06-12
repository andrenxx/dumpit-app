# Code reviewer checklist

This is the canonical checklist used by `/code-review`. Edit here, not in
the skill workflow — `SKILL.md` reads this file at runtime.

## Items

For every item: respond **pass**, **concern**, or **blocker**, with a
one-line justification quoting the diff or the spec when applicable.

### 1. Diff stays inside section 5 (Files) of the spec

Every file in the diff must appear in the spec's Files table (or the
spec must have been edited to include it, which triggers
invalidation — see item 8). Files in the diff that are not in the spec
and not justified by an inline spec edit are a **blocker**.

### 2. Goals from section 2 are observably met

For each Goal in the spec, point to the diff line(s) that fulfill it.
A Goal that has no corresponding code change (and is not explicitly
deferred) is a **blocker**.

### 3. No drive-by edits unrelated to the spec

Cosmetic refactors, formatting changes, or unrelated fixes should not
land in this PR. They are a **concern** if small, a **blocker** if they
expand the diff materially.

### 4. No new `console.log` in committed code

`console.warn` and `console.error` are allowed when intentional. New
`console.log` in non-test code is a **blocker**.

### 5. No hardcoded secrets

Anything that looks like an API key, token, or credential must come
from `src/lib/env.ts` (or the per-skill equivalent). Hardcoded secrets
are a **blocker**.

### 6. Sanity gates relevant to this diff ran clean

The contributor should have run `run-sanity-gates.sh` before each
commit; the helper classifies the diff and runs only the gates that
apply (Node gates for `*.ts`/`*.js`/..., `bash -n` for `*.sh`, no gates
for docs-only chunks). Gate failures are a **blocker**. Absence of
evidence on a chunk that *should* have produced gate output (e.g., a
Node diff with no `lint` log) is a **concern**. A docs-only or
shell-only chunk with no Node-gate output is **expected** and not a
concern.

### 7. New shell helpers parse with `bash -n`

Any new `*.sh` file in the diff must parse cleanly. Issue [#16](https://github.com/aurora-crista/pregacao-dev/issues/16) tracks automating this; until then, the reviewer runs `bash -n` mentally or asks the contributor to.

### 8. Spec edits, if any, are honest

If the diff includes changes to the spec file (`docs/specs/NNN-*.md`),
the changes must reflect a real deviation discovered during
implementation. Editorial polishing of an approved spec is a **concern**
(should have been caught at spec-review). The skill removes
`spec:approved` regardless; this checklist item is about whether the
deviation is documented honestly.

### 9. Acceptance criteria are reachable from this diff

Walk through section 6 of the spec. Every criterion not yet satisfied
should be either: (a) demonstrably reached by this diff, or (b)
explicitly deferred with a follow-up issue link. Otherwise it's a
**concern**.

### 10. No phase-leakage from later phases

For multi-phase initiatives, the diff must not include code from a
later phase. Leakage is a **blocker**.

### 11. UX copy aligns with voice and tone

Skip this item silently when the parent discovery had
`ux: not-applicable` or when no parent discovery exists (e.g. fresh
spec opened without `/discover`).

When the parent discovery had `ux: required`: walk new and modified
user-facing strings in the diff (button labels, error messages, empty
states, tooltips, confirmations). For each, check that the tone
matches the row the spec's "UX decision" section (§4.5) claimed it
would, and that the voice principles in
[`docs/ux/voice-and-tone.md`](../../../../docs/ux/voice-and-tone.md)
are honored.

Two failure modes:

- A string whose tone diverges from the matrix row the spec named for
  it. **Concern** — the matrix is non-exhaustive and reasoned
  divergence may be defensible, but the reviewer should call it out.
- A string in a context not yet listed in `voice-and-tone.md` and not
  proposed in the spec's §4.5. **Concern** with a one-line nudge to
  add it to the matrix on a follow-up.

Item 11 never produces a **blocker**: copy judgment is editorial,
and the round-trip cap (spec 048) protects against debate loops.

## Output format

Three groups, same shape as `/spec-review`:

```
✅ Pass
- 1. Diff stays inside section 5 — all 18 changed files appear in the spec.
- ...

⚠️ Concerns
- 3. No drive-by edits — `src/lib/env.ts` got a comment-only tweak unrelated to the spec.

❌ Blockers
- 4. No new console.log — `src/worker/processor.ts:88` introduces a console.log left from debugging.

Item 11 example (when parent discovery had `ux: required`):

⚠️ Concerns
- 11. UX copy aligns with voice and tone — `src/components/UploadCard.tsx:42` says "Erro ao processar áudio." which is repreensive (matrix says erro de validação tom = útil, ensina); spec §4.5 proposed "Use MP3 ou WAV…".
```

Empty sections write `(none)`.
