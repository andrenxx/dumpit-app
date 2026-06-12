---
name: decompose
description: Turn a too-big draft spec into N child sub-issues, each with their own branch and placeholder draft PR, while rewriting the parent spec into a decomposition record. Children proceed via the normal flow.
---

# /decompose

> **Root anchoring.** All paths in this skill are root-relative. Before any
> file operation, ensure cwd is the repo root
> (`cd "$(git rev-parse --show-toplevel)"`).

## When to use

`/spec-review` returned a `decompose` verdict and applied the
`spec:requires-decomposition` label to the draft PR. The label is the
gate; this skill refuses to run without it.

Skip when:
- The PR lacks `spec:requires-decomposition`. The judgement that a spec
  needs splitting belongs to `/spec-review`'s fresh-context audit, not
  to the author or the decompose skill itself. Run `/spec-review` first.
- The PR already has `spec:approved`. Decomposition rewrites the spec
  body, which would invalidate the approval. Reset by running
  `/spec-review` after, or postpone the decomposition.
- The feature is genuinely small. Just ship it.

## Inputs

- `/decompose` — operates on the current branch's PR.
- `/decompose <pr-number>` — explicit PR.

## Workflow

### 1. Resolve PR + parent issue + verify label

```bash
pr=${1:-$(.claude/skills/implement/helpers/current-pr.sh)}
parent=$(gh pr view "$pr" --json body --jq .body | grep -oE 'Closes #[0-9]+' | head -1 | grep -oE '[0-9]+')

# Hard gate: the spec-review fresh-context verdict is the only path in.
labels=$(gh pr view "$pr" --json labels --jq '.labels[].name')
if ! printf '%s\n' "$labels" | grep -qx "spec:requires-decomposition"; then
  echo "Error: PR #$pr lacks 'spec:requires-decomposition'. Run /spec-review first;" >&2
  echo "decomposition is the verdict of the fresh-context audit, not the author's call." >&2
  exit 1
fi
```

If `Closes #N` is missing or `spec:approved` is present, surface the
problem and stop.

### 2. Locate the parent spec

```bash
spec_path=$(.claude/skills/spec-review/helpers/load-spec.sh "$pr")
```

### 3. Read the chunks block from the spec-review audit

The fresh-context audit attached its chunk recommendation to the PR
via `apply-decomposition-label.sh`. Fetch the most recent comment
posted by that helper and parse the fenced ` ```chunks ` block:

```bash
chunks_block=$(gh pr view "$pr" --json comments --jq \
  '[.comments[] | select(.body | contains("apply-decomposition-label.sh"))] | last | .body' \
  | awk '/^```chunks$/,/^```$/' | sed '1d;$d')
```

If the block is empty or absent, surface the problem and stop — the
audit must be re-run. Each non-empty line is one chunk in the form
`- <title>: <one-line scope>`.

For each chunk parsed, derive:

- The title (verbatim, ≤ 60 chars).
- The scoped goal (the line's scope text, refined into 1–2 sentences).
- The slug (computed via `slugify.sh "<title>"`).
- The subset of parent files this piece owns (LLM-inferred from the
  spec's section 5 keyed to the chunk's scope; informational — the
  child's section 5 is finalized when `/spec` runs later).

Show the parsed chunks to the user via a single `AskUserQuestion`:

> "Parsed N chunks from the spec-review audit. Accept and open child issues? (yes / no)"

On `no`: stop. No GitHub mutation has happened. The author can edit
the spec and re-run `/spec-review` to refine the chunks.

### 4. For each accepted child piece

Iterate in the order the user reviewed:

```bash
# a. Open child issue
.claude/skills/spec/helpers/open-feature-issue.sh "<title>" "<body-tmp>" "<type-label>"
#    The body is a feature.yml composition: Context (linking parent),
#    Goal, Out of scope, Acceptance.
#    Capture the issue number $M.

# b. Link as sub-issue of the parent
.claude/skills/decompose/helpers/link-sub-issue.sh "$parent" "$M"

# c. Create the child branch on origin/main without checking out.
#    Read the child's `type:*` label and map per /spec § 2.1:
#      type:feature → feat,  type:bug → fix,  type:chore → chore
#    Refuse if the child has zero or multiple type:* labels (mirrors
#    /spec's rule); the user must fix the labels and re-run.
slug=$(.claude/skills/_shared/helpers/slugify.sh "<title>")
type_labels=$(gh issue view "$M" --json labels --jq '.labels[].name' | grep -E '^type:[a-z]+$' || true)
case "$(printf '%s\n' "$type_labels" | grep -cE '^type:[a-z]+$' || true)" in
  1) ;;
  0) echo "Error: child #$M has no type:* label; add one and re-run /decompose." >&2; exit 1 ;;
  *) echo "Error: child #$M has multiple type:* labels: $type_labels" >&2; exit 1 ;;
esac
case "$type_labels" in
  type:feature) branch_type=feat ;;
  type:bug)     branch_type=fix ;;
  type:chore)   branch_type=chore ;;
  *) echo "Error: unrecognized type label on #$M: $type_labels" >&2; exit 1 ;;
esac
branch=$(.claude/skills/decompose/helpers/create-detached-branch.sh "$M" "$slug" "$branch_type")

# d. Capture: number=$M, title, summary, branch
# Append into a children JSON array for step 5.
```

The skill does **not** scaffold the child spec or open a child PR
automatically. The contributor (or whoever picks the child up) runs
`/spec <M>` later — that scaffolds the spec on the child branch and
opens the child's draft PR via the standard flow. Until then, the
child issue exists, the branch exists on origin, and the sub-issue
link is visible on the parent.

### 5. Rewrite the parent spec

```bash
# Write the children JSON to a tempfile.
echo "$children_json" > /tmp/decompose-children.json

# Rewrite parent spec body.
.claude/skills/decompose/helpers/rewrite-parent-spec.sh "$spec_path" /tmp/decompose-children.json
```

The helper preserves the metadata header (changing Status to
`Decomposed — tracking children`), backs up the original to
`<spec>.pre-decompose.md`, and replaces sections 1–8 with a
decomposition record listing each child.

### 6. Commit and push the parent rewrite

```bash
git add "$spec_path" "${spec_path%.md}.pre-decompose.md"
git commit -m "chore(#$parent): decompose into ${#children[@]} children: $(printf '#%s ' "${children_numbers[@]}" | sed 's/ $//')"
git push
```

The backup file `pre-decompose.md` is gitignored later if it accumulates;
in the bootstrap, leave it committed for one cycle so reviewers can
diff if needed.

### 7. Update the parent PR body

```bash
gh pr edit "$pr" --body "<updated body summarizing the decomposition + linking children>"
```

The parent PR is still draft. It now holds only the decomposition
record. It proceeds through `/spec-review` (re-review the rewritten
record), `/code-review` (it's docs-only), and `/ship`.

### 8. Report back

Print:

```
Parent decomposed:
  Issue:   #$parent <issue-url>
  PR:      #$pr <pr-url>  (now containing the decomposition record)
  Spec:    $spec_path  (backup at ${spec_path%.md}.pre-decompose.md)

Children created (issue + sub-issue link + branch on origin):
  #M1  <title-1>
       branch: feat/M1-<slug>
  #M2  <title-2>
       ...

Next steps:
  - Re-run /spec-review against the parent PR to apply spec:approved
    on the decomposition record.
  - For each child, run /spec <child-number> to scaffold the spec on
    its branch and open its draft PR.
  - Children proceed independently through the standard flow.
```

## Anti-patterns

- **Auto-accepting your own proposal.** Always confirm via
  `AskUserQuestion`. The agent is the proposer; the human is the
  decider.
- **Decomposing a spec that already has `spec:approved`.** That label
  was earned on the previous body; the rewrite must trigger a fresh
  spec-review.
- **Stacking children on the parent branch.** Children target `main`.
  GitHub sub-issue links keep the parent-child relationship visible;
  branch hierarchy is not the project's convention.
- **Deleting the `pre-decompose.md` backup before the next cycle.**
  Reviewers may want to diff the original against the children's
  scopes.
- **Forgetting to run `/spec <child>` later.** Without the child's PR,
  the work is invisible to `/status`. The decomposition record on the
  parent lists each child's number; running `/spec <N>` on each child
  turns it from "issue with a branch" into a real PR.

## Output contract

On success: parent issue still open, parent PR still draft (now small
and trackerful), N children exist with their own issues/branches/PRs,
sub-issue links visible on GitHub, parent spec body rewritten with a
backup beside it.

On rejection (user says no in step 3): no mutation; the parent is
exactly as it was.

On failure mid-flight: the helpers exit non-zero with stderr; partial
state is possible (one child created and linked, the next failed).
The user can re-run after fixing; the child issue creation is not
idempotent (a second run creates a second issue), so manually clean
up the partial state before retrying.

## See also

- [`examples/README.md`](examples/README.md) — sample transcript.
- [`/spec`](../spec/SKILL.md) — used afterward on each child.
- [`/spec-review`](../spec-review/SKILL.md) — re-runs against the
  rewritten parent record.
- [`/status`](../status/SKILL.md) — surfaces children and placeholders.
