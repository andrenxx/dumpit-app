# `/adr` — example transcripts

## Example 1 — title + description, sections drafted

```
User: /adr Use SSE for notifications -- After comparing WebSockets and SSE, we
      pick SSE because we only need server→client push, no client→server
      messaging, and SSE rides over standard HTTP/2 with no extra infra.

Skill: [next-adr-num.sh] 0002
       [slugify.sh "Use SSE for notifications"] use-sse-for-notifications
       [scaffold-adr.sh 0002 use-sse-for-notifications "Use SSE for notifications"]
       docs/architecture/decisions/0002-use-sse-for-notifications.md
       [LLM drafts Context, Decision, Consequences sections from description]
       [git add docs/architecture/decisions/0002-use-sse-for-notifications.md]

       ADR scaffolded: docs/architecture/decisions/0002-use-sse-for-notifications.md
       Branch:         feat/42-notifications
       Drafted:        yes (sections proposed from description; please review)

       Edit and commit when ready (e.g., git commit -m "docs: add ADR 0002 on SSE for notifications").
```

## Example 2 — title only, sections kept as template prompts

```
User: /adr Adopt Vitest as the test framework

Skill: [next-adr-num.sh] 0003
       [slugify.sh] adopt-vitest-as-the-test-framework
       [scaffold-adr.sh 0003 adopt-vitest-as-the-test-framework "Adopt Vitest as the test framework"]
       docs/architecture/decisions/0003-adopt-vitest-as-the-test-framework.md
       [no LLM pass — no description was given]
       [git add ...]

       ADR scaffolded: docs/architecture/decisions/0003-adopt-vitest-as-the-test-framework.md
       Branch:         feat/N-add-tests
       Drafted:        no — sections kept as template prompts

       Edit and commit when ready.
```

## Example 3 — refusal: empty title

```
User: /adr

Skill: What's the title for this ADR? (short imperative, e.g., 'Use SSE for notifications')

User: (presses enter)

Skill: Error: title must not be empty
       Stopped. Run /adr again with a non-empty title.
```

## Example 4 — refusal: target file already exists

```
User: /adr Use SSE for notifications

Skill: [next-adr-num.sh] 0002
       [slugify.sh] use-sse-for-notifications
       [scaffold-adr.sh 0002 use-sse-for-notifications "Use SSE for notifications"]
       Error: ADR file already exists at docs/architecture/decisions/0002-use-sse-for-notifications.md

       Stopped. The number/slug collide with an existing ADR. Adjust the title
       or check that the previous run committed cleanly.
```
