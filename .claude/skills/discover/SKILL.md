---
name: discover
description: Turn a pain or vague idea into a phase:discovery GitHub issue with one round of forcing questions. Use when the problem is still vague and needs framing before committing to a spec.
---

# /discover

## When to use

The user has a pain, complaint, or vague idea but the framing is not clear yet.

Examples that fit:

- "Worker keeps timing out on big files."
- "Dashboard config feels wrong."
- "We should probably do something about TTS errors."

Skip this skill when the user already knows what to build — go straight to
`/spec`.

## Workflow

### 1. Receive or prompt for the pain

If the user invoked the skill with text after `/discover`, that text is the
initial pain. Otherwise, ask:

> "What's the pain you want to frame?"

### 2. Forcing questions

Ask up to 7 questions, **one at a time**, using `AskUserQuestion`. Each
question pushes toward concrete framing instead of solutions. Stop early if
the answers converge cleanly — quality beats exhausting the list.

| # | Question                                                                                              |
| - | ----------------------------------------------------------------------------------------------------- |
| 1 | Concrete recent example. "Walk me through a specific recent occurrence — file, error, what happened?" |
| 2 | Why now. "What changes if we ignore this for another month? Who feels the pain?"                      |
| 3 | What was tried. "What have you tried or considered so far?"                                           |
| 4 | Framings considered. "Any specific options or framings you've already thought about? (Optional)"      |
| 5 | Validation signal. "How would we know this is resolved? Describe the observable signal — behavior, not feature." |
| 6 | UX scope. "Does this change something the user sees or interacts with — a screen, a flow, a copy element?" Maps to the `ux:` field on the issue. Default: `not-applicable`. |
| 7 | Type label. "Feature, chore (tooling/process), or bug?" Default: `type:feature`.                      |

Question 5 is required when the discovery is likely to proceed to a
spec; it can be left empty for discoveries that close as "not worth
pursuing".

**Heuristic for question 6** (UX scope): API-only, worker-only,
infrastructure, tooling, or skill changes are `not-applicable`.
Anything that renders new UI, alters an existing flow, or introduces
user-facing copy is `required`. Bug fixes that reword existing copy
count as `required`. The user can override either way; the skill does
not argue.

### 2.5 UX research branch (only when `ux: required`)

Skip this section entirely when question 6 answered `not-applicable` —
the rest of `/discover` runs unchanged.

When `ux: required`, run three research passes between question 7 and
step 3 (synthesize). Each pass is a subagent invocation when the work
is non-trivial; for small problems do it inline.

1. **Use-case research.** What experience patterns fit this pain in
   general (modal confirmation, inline preview, progressive
   disclosure, etc.)? Output: 2–4 patterns named, one-line trade-off
   each.
2. **Competitor research.** How do 1–3 comparable products (Buzzsprout,
   Spotify for Podcasters, Anchor, Riverside, etc.) solve the same
   pain? Output: short notes per competitor naming the pattern they
   chose and why it works (or doesn't) for them.
3. **Internal research.** What does this project already do for
   similar pains? Output: list of existing screens / components /
   flows with file paths from `src/`, plus a verdict on whether to
   extend or replace.

Capture the three passes into a single tmp file (research). Then
generate **exactly three options** following
[`helpers/ux-option.md`](helpers/ux-option.md), capturing them into a
second tmp file (options). Constraints from the option template
(Aurora design system, mobile-first, PWA-aware, a11y ex-ante, voice
and tone) are non-negotiable — regenerate options that violate them.

Compose the UX section by piping both files through the helper:

```bash
.claude/skills/discover/helpers/ux-research.sh "$research_tmp" "$options_tmp" > "$ux_section_tmp"
```

The result will be appended verbatim to the issue body in step 3.

### 3. Synthesize the discovery body

Compose an issue body matching `discovery.yml`:

```
### Problem statement
<concrete framing, not a solution>

### Why now
<consequence of inaction, who feels it>

### UX scope
<ux: required | not-applicable — from question 6>

### How would we know this is resolved?
<observable signal — behavior, not feature>

### Options considered
- <option 1>: <one-line trade-off>
- <option 2>: <one-line trade-off>

(Omit "Options considered" if too early to enumerate.)

<UX research + UX options sections appended here when ux: required.
Cat "$ux_section_tmp" inline at this point in the body. The order is:
options-considered → ux research → ux options → recommended next step.>

### Recommended next step
<either "open feature issue and run /spec" or "wait/observe">
```

Save to a temp file: `mktemp -t discover-body`.

### 4. Derive a title

The issue title is a **short imperative describing the pain, not the
solution**. Examples:

- ✅ "Worker timeouts on > 50MB files"
- ❌ "Add Redis queue"
- ✅ "Dashboard config drifts between sessions"
- ❌ "Migrate config to Postgres"

If the user's initial pain reads as a solution ("Add Redis queue"), reframe
the title to the pain it solves.

### 5. Open the issue

```bash
.claude/skills/discover/helpers/open-discovery-issue.sh "<title>" "<body-tmp>" "<type-label>"
```

The helper prints the issue URL on success. On failure, surface the stderr
to the user verbatim and stop.

### 6. Report back

Print three lines to the user:

```
Discovery issue opened: <url>
Type: <type-label>
Next step: when ready, run `/discovery-review #<N>` to audit the framing, then `/spec #<N>`.
```

`/spec` is gated on `phase:discovery-reviewed`; running it before
`/discovery-review` will refuse with no override path.

## Anti-patterns

- **Inventing pain the user did not state.** If they said "worker times out",
  do not extrapolate to "we need a queue rewrite".
- **Skipping forcing questions to save time.** The questions are the value —
  they extract specifics that prevent generic specs later.
- **Auto-pivoting to a spec.** End with the suggestion, not with `/spec`
  already running.
- **Title that smells like a solution.** Reframe to the pain.

## Output contract

On success: a `phase:discovery` issue exists in the repo with the typed
labels, body, and a title that names the pain. The user has the URL and the
next-step suggestion.

On failure: nothing partial — no issue, no draft, no orphan files. Surface
the helper's stderr and stop.

## See also

- [`examples/README.md`](examples/README.md) — sample transcript.
- [`/spec`](../spec/SKILL.md) — next step after discovery.
