---
name: adr
description: Scaffold a new ADR file with metadata pre-filled and (when given a description) draft Context / Decision / Consequences as a proposal. The new ADR rides on the current feature branch; the skill does not commit or open a PR.
---

# /adr

## When to use

A load-bearing decision is being made (or has just been made) and needs
to land in `docs/architecture/decisions/`. Examples:

- "We will use SSE instead of WebSockets for the notification stream."
- "We will adopt Vitest as the test framework."
- "We will store the dashboard config in Postgres rather than disk."

Skip when the choice is local and reversible — ADRs are for decisions
that **constrain future work**, not implementation notes.

The skill assumes you are already on a feature branch (or `main` for an
out-of-band ADR). It does not open a branch or PR; the new ADR rides on
whatever branch the contributor is on and is committed alongside the
related spec or code commits.

## Inputs

- `/adr <title>` — title only; sections left as template prompts for the
  contributor to fill.
- `/adr <title> -- <description>` — `<description>` seeds the LLM pass
  that drafts Context / Decision / Consequences as a proposal.
- `/adr` — prompts for title (and optional description).

## Workflow

### 1. Resolve title and description

If the user did not pass a title, prompt:
> "What's the title for this ADR? (short imperative, e.g., 'Use SSE for notifications')"

Refuse empty titles.

If the user did not pass a description (no `--` separator), optionally
prompt:
> "Optional: describe the decision in 2–4 sentences so I can draft Context / Decision / Consequences. Leave blank to use template prompts only."

### 2. Compute names

```bash
nnnn=$(.claude/skills/adr/helpers/next-adr-num.sh)
slug=$(.claude/skills/_shared/helpers/slugify.sh "<title>")
```

If `slug` ends up empty, surface the error and stop.

### 3. Scaffold the file

```bash
path=$(.claude/skills/adr/helpers/scaffold-adr.sh "$nnnn" "$slug" "<title>")
```

The helper writes the file with:
- Title = `<title>`
- Status = `Proposed`
- Date = today (UTC, `YYYY-MM-DD`)
- Body sections preserved as template prompts.

### 4. LLM pass — draft sections (only when description provided)

When the user passed a description, edit the file in place. Replace the
template prompt under each section with a **drafted proposal** grounded
in the description and any code context relevant to the decision.

Guidance:
- **Context.** What forces are at play? Cite constraints, prior art,
  alternatives. Short — one or two paragraphs.
- **Decision.** Active voice, present tense: "We will use X". One or two
  paragraphs.
- **Consequences.** What becomes easier, harder, different. Be honest
  about the painful parts. Three to six bullet points or a short
  paragraph.

Keep the proposal short. ADRs that go pages unread.

When no description was provided, leave the template prompts untouched
so the contributor knows what each section asks for.

### 5. Stage but do not commit

```bash
git add "$path"
```

Do **not** commit. ADRs typically land alongside spec or code commits
on the same branch; the contributor groups them as they like.

### 6. Report back

Print:

```
ADR scaffolded: <path>
Branch:         <current-branch>
Drafted:        <yes if description was provided | no — sections kept as template prompts>

Edit and commit when ready (e.g., `git commit -m "docs: add ADR <nnnn> on <topic>"`).
```

## Anti-patterns

- **Committing on the contributor's behalf.** The contributor groups
  ADRs with related work; the skill stages, the contributor commits.
- **Drafting sections without a real description.** Filling the template
  prompts with low-confidence guesses is worse than leaving them as
  prompts the contributor will replace.
- **Creating an ADR for an implementation detail.** ADRs are for
  decisions that constrain future work; everything else is just code
  comments.
- **Editing existing ADRs to change the decision.** Existing ADRs are
  immutable except for status (e.g., `Accepted` → `Superseded by ADR-0042`).
  When superseding, create a new ADR and link to the old one in its
  Context section.

## Output contract

On success: a new file `docs/architecture/decisions/<nnnn>-<slug>.md`
exists, is staged for commit, has correct metadata, and has either a
drafted body (description provided) or template prompts (no description).

On failure: nothing partial. Surface the helper's stderr and stop.

## See also

- [`examples/README.md`](examples/README.md) — sample transcript.
- [`docs/architecture/decisions/_template.md`](../../../docs/architecture/decisions/_template.md) — the template the helper copies.
- [`/spec`](../spec/SKILL.md) — feature specs that may reference ADRs.
