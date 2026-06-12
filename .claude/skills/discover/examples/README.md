# `/discover` — example transcripts

## Example 1 — concrete pain, fast convergence

```
User: /discover worker keeps timing out on bigger uploads

Skill: Walk me through a specific recent occurrence — file, error, what happened?

User: Yesterday a 65MB MP3, gateway-style timeout after ~60s, job stayed in
"processing" forever in the JSON DB.

Skill: What changes if we ignore this for another month? Who feels it?

User: We're starting onboarding a second client this month. They'll send
80–120MB sermons regularly. We can't ship that.

Skill: What have you tried or considered so far?

User: Bumped the worker poll interval thinking it was a race; didn't help.
Considered streaming concat instead of buffering.

Skill: Any framings already in mind? (Optional)

User: Streaming concat, or chunked uploads. Both seem invasive.

Skill: Feature, chore, or bug?

User: Bug — the PoC promised these sizes.

Skill: Discovery issue opened: https://github.com/aurora-crista/pregacao-dev/issues/42
       Type: type:bug
       Next step: when ready, run `/discovery-review #42` to audit the framing, then `/spec #42`.
```

The title in this case: `Worker timeouts on uploads > 50MB`.

## Example 2 — early framing, "wait/observe" outcome

```
User: /discover dashboard config feels wrong

Skill: Walk me through a specific recent occurrence?

User: Honestly nothing recent. Just a vibe.

Skill: What changes if we ignore this for another month? Who feels it?

User: Nothing immediate. Just the next dev who reads it will be confused.

Skill: What have you tried or considered so far?

User: Nothing concrete.
```

The skill recognizes this is too early. Recommended next step in the issue
becomes:

> "Wait for a concrete pain (a contributor confused, a real bug). Reframe and
> reopen if/when that happens."

The issue still gets opened with `phase:discovery` so the thought is captured,
but no `/spec` follow-up is suggested.

## Example 3 — UX-required pain, three options surfaced

```
User: /discover dashboard upload state feels confusing — users don't know what's happening

Skill: Walk me through a specific recent occurrence?

User: A pastor uploaded a 40MB sermon, hit "Enviar", and the page just sat
there for ~90s with no feedback. He thought it had failed and re-uploaded.

Skill: What changes if we ignore this for another month? Who feels it?

User: The pilot churches are starting to use this regularly. Re-uploads
double the worker load and confuse the queue. Pain falls on small-church
volunteers, not just the pastor.

Skill: What have you tried or considered so far?

User: Considered a progress bar, considered a toast, considered redirecting
to a status page. Haven't picked.

Skill: Any framings already in mind? (Optional)

User: Toast feels too transient. Status page feels too heavy.

Skill: How would we know this is resolved?

User: After hitting "Enviar", the user sees a clear acknowledgment within
2 seconds, knows roughly how long to wait, and doesn't re-upload.

Skill: Does this change something the user sees or interacts with — a
screen, a flow, a copy element?

User: Yes — definitely a UI change.  [→ ux: required]

Skill: Feature, chore, or bug?

User: Feature.

Skill: <runs three research passes — use-case, competitors, internal —
       then generates three options per helpers/ux-option.md, assembles
       via helpers/ux-research.sh into the body>

Skill: Discovery issue opened: https://github.com/aurora-crista/pregacao-dev/issues/<N>
       Type: type:feature  UX scope: required
       Body includes: UX research (3 passes) + UX options (A inline-progress
       card, B dedicated status page, C toast + sticky banner).
       Next step: when ready, run `/discovery-review #<N>` to audit the framing, then `/spec #<N>`.
```

The feature spec generated from this discovery's `4.5 UX decision`
section will record which option won and why; new tone-matrix rows
proposed there (e.g. "long-running upload progress") get promoted to
`docs/ux/voice-and-tone.md` on `/ship` if reusable.
