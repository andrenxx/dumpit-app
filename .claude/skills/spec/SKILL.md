---
name: spec
description: Turn a discovery issue (or fresh idea) into an issue + branch + drafted spec proposal + draft PR. The spec arrives complete enough to read and edit, not as an empty template.
---

# /spec

> **Root anchoring.** All paths in this skill are root-relative. Before any
> file operation, ensure cwd is the repo root
> (`cd "$(git rev-parse --show-toplevel)"`).

## When to use

The user knows roughly what to build and is ready to commit to a spec. One of:

- An existing `phase:discovery` issue is mature: `/spec <issue-number>`.
- A fresh idea where the framing is already clear: `/spec` or
  `/spec <free-form description>`.
- The user wants alternatives surfaced even when confidence is high:
  add `--options`.
- The branch prefix needs to be something other than the issue's `type:`
  label implies: pass `--branch-type=<feat|fix|chore>`.

Use `/discover` first if the framing is still vague. Existing
discoveries must carry `phase:discovery-reviewed` (apply via
`/discovery-review <N>`) before `/spec` will promote them.

## Workflow

### 1. Resolve the issue

**Existing discovery (`/spec <issue-number>`):**

1. Read the issue: `gh issue view <N> --json title,body,labels`.
2. **Verify the discovery has been audited.** Run:
   ```bash
   .claude/skills/discovery-review/helpers/verify-discovery-reviewed.sh <N>
   ```
   The helper exits 0 only when `phase:discovery-reviewed` is
   present. On non-zero exit, surface the helper's stderr verbatim
   and stop — there is no override flag. The user must run
   `/discovery-review <N>` first. The strict-binary audit is the
   project's discovery sensor; bypass would defeat the harness.
3. Confirm with the user via `AskUserQuestion`:
   > "Title is currently '<title>'. Adjust now that the framing is clearer?"
4. If yes, ask for the new title and update via
   `gh issue edit <N> --title "<new-title>"`.
5. Promote labels:
   ```bash
   .claude/skills/spec/helpers/promote-discovery.sh <N>
   ```
6. Capture the **final** title for downstream steps.

**Fresh idea (`/spec` or `/spec <free-form>`):**

1. If no description, prompt for context.
2. Ask 2–3 clarifying questions to extract: feature title, type label,
   problem statement, intended scope.
3. Compose a feature issue body matching `feature.yml`:
   - Context, Goal, Out of scope, Acceptance.
4. Save body to `mktemp -t feature-body`.
5. Open the issue:
   ```bash
   .claude/skills/spec/helpers/open-feature-issue.sh "<title>" "<body-tmp>" "<type-label>"
   ```
6. Capture the issue number and title.

After step 1 you always have a feature issue with `phase:spec` and a final title.

### 2. Compute names

```bash
slug=$(.claude/skills/_shared/helpers/slugify.sh "<final issue title>")
nnn=$(.claude/skills/_shared/helpers/next-spec-num.sh <N>)
# Branch:    <branch_type>/<N>-<slug>
# Spec file: docs/specs/<nnn>-<slug>.md
```

#### 2.1 Resolve `branch_type`

Pick the branch prefix once, in this precedence order:

1. **Explicit override.** If `--branch-type=<X>` was passed and
   `X ∈ {feat, fix, chore}`, use `X`. Any other value → refuse with a
   clear error and stop. (No silent fallback on a typo like
   `--branch-type=feature`.)
2. **Existing-issue path.** When `gh issue view <N>` returned exactly
   one `type:*` label, map it: `type:feature → feat`,
   `type:bug → fix`, `type:chore → chore`. Multiple matching labels →
   refuse and ask the user to pass `--branch-type=` to disambiguate.
3. **Fresh-idea path.** The user's answer to the type-label clarifying
   question becomes `branch_type` (and the label passed to
   `open-feature-issue.sh`). Default `feat` if the question was
   skipped.
4. **Fallback.** No type label and no override on an existing issue:
   warn and default to `feat`, with a note in the report-back asking
   the user to add a `type:*` label before review.

`branch_type` is computed here and passed verbatim to the helpers in
steps 3, 4, and 8 — the helpers do not re-derive it.

### 3. Create the branch

```bash
.claude/skills/spec/helpers/new-feature-branch.sh <N> <slug> <branch_type>
```

The helper guards against dirty trees and existing branches. If it fails,
surface stderr verbatim and stop — do not retry by force.

### 4. Scaffold the spec metadata

```bash
spec_path=$(.claude/skills/spec/helpers/scaffold-spec.sh <N> <slug> <branch_type>)
```

This writes the spec file with metadata filled (NNN, issue link, branch).
The body is still the template prompts.

### 5. LLM pass — draft all sections as a proposal

Read the issue body and any code context that helps. Edit the spec file in
place, replacing template prompts with a **drafted proposal** for every
section:

| Section          | What to draft                                                                         |
| ---------------- | ------------------------------------------------------------------------------------- |
| Heading          | Replace `<Title>` with the feature title.                                             |
| Metadata table   | Set `Status` to `Draft — awaiting review`. Set `Type` from the issue's type label.    |
| 1. Context       | Refined from issue, expanded with code observations.                                  |
| 2. Goals         | Decomposed from the issue's Goal into N verifiable goals.                             |
| 2.5 Validation strategy | Drafted from the issue's `validation-strategy` field (or the discovery's `validation-signal` if no feature field present), refined into the oracle the spec promises. Name the behaviors verified, seams required, fixtures, flows — not "we'll write tests". |
| 3. Non-goals     | Refined from "Out of scope", with inferred additional non-goals.                      |
| **4. Design**    | Complete proposal with sub-sections.                                                  |
| 5. Files         | Realistic list derived from the Design. Use the table format from the template.       |
| 6. Acceptance    | Objective checklist derived from Goals.                                               |
| 7. Risks         | Honest list with mitigations.                                                         |
| 8. Rollout       | Landing plan, typically N commits + dry run.                                          |

**Design section (4) — single approach by default:**

- Propose **one** recommended approach with sub-sections.
- Add an "Alternatives considered" sub-section listing 2–3 options as
  one-liners with their trade-offs **only when**:
  - The `--options` flag was passed by the user, OR
  - Your confidence in the recommended approach is moderate and the
    alternatives are genuinely defensible.

**Important:** every section is a **draft proposal**, not a contract. Mark
the status as `Draft` in the metadata. The human reviewer challenges
framings — do not fill confidence you do not have. When unsure, prefer
fewer sub-sections in Design and call it out.

### 7. Commit and push

```bash
git add docs/specs/<nnn>-<slug>.md
git commit -m "chore(#<N>): draft spec for <slug>"
git push -u origin <branch_type>/<N>-<slug>
```

Push must succeed before opening the PR.

### 8. Open the draft PR

```bash
.claude/skills/spec/helpers/open-spec-pr.sh <N> "<feature-title>" <branch_type>
```

The PR title prefix tracks `branch_type` (`feat:`, `fix:`, `chore:`).
Output: the PR URL.

`/spec` no longer signals tamanho. The decomposition decision is the
fresh-context verdict of `/spec-review` (item 12); the author's only
size-signal happens at review time, by design.

### 9. Report back

Print to the user:

```
Issue:    <issue-url>
Type:     <branch_type>
Branch:   <branch_type>/<N>-<slug>
Spec:     <spec-path>
PR:       <pr-url>

Review the drafted spec, edit as needed, then run `/spec-review`.
```

## Anti-patterns

- **Creating the branch before the issue.** The issue number is the join
  key for everything else.
- **Drafting without reading the issue body and relevant code.** The
  proposal must be grounded.
- **Pre-filling sections with confidence you do not have.** Status is
  `Draft`; mark the uncertainty.
- **Marking the PR ready (non-draft).** Both reviews happen on the draft
  PR; `/ship` (Phase 1.2) marks ready.
- **Picking `feat/` for a fix or chore.** Breaks PR-title conventions and
  confuses type-label invariants. Honor the issue's `type:*` label, or
  pass `--branch-type=<feat|fix|chore>` when you need to override.

## Output contract

On success:
- A `phase:spec` GitHub issue exists.
- A `<feat|fix|chore>/<N>-<slug>` branch exists locally and on origin,
  matching the resolved `branch_type`.
- A `docs/specs/<nnn>-<slug>.md` file is committed and pushed.
- A draft PR is open with the right `<type>:`-prefixed title, body, and
  `Closes #<N>`.

On failure at any step: surface the helper's stderr and stop. Do not leave
half-committed state.

## See also

- [`examples/README.md`](examples/README.md) — sample transcript.
- [`/discover`](../discover/SKILL.md) — upstream framing skill.
- [`/spec-review`](../spec-review/SKILL.md) — next step after `/spec`.
