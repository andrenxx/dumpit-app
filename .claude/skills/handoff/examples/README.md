# `/handoff` — example transcripts

## Example 1 — handing off to another contributor

```
User: /handoff @maria

Skill: [resolves PR #56, issue #55]
       [gather-state.sh 56 55]
       branch: feat/55-add-ogg-upload-support
       last commit: a1b2c3d "feat(#55): accept OGG uploads via mime allowlist"
       commit count: 1
       touched: src/lib/validation.ts, src/app/api/process-audio/route.ts
       issue labels: phase:implementing, type:feature
       PR labels: spec:approved

Skill: Spec progress (pre-fill below; accept or edit):
       - ✅ src/lib/validation.ts — mime allowlist
       - ✅ src/app/api/process-audio/route.ts — wired
       - ⏳ src/worker/ffmpeg.ts — not started

User: accept

Skill: Open decisions to capture (text, or empty)?

User: Whether the OGG transcode happens in the upload route (sync) or
      in the worker (async). I was leaning async.

Skill: Gotchas?

User: Found ffmpeg-static does not include OGG codecs by default —
      needs --enable-libvorbis. Currently fails on local install.

Skill: Suggested next step?

User: Add the worker branch for OGG → MP3 in src/worker/ffmpeg.ts;
      verify ffmpeg build issue first.

Skill: [composes body, posts]
       Issue:    https://github.com/aurora-crista/pregacao-dev/issues/55
       Comment:  https://github.com/.../issues/55#issuecomment-...
       Assignee: @ygor → @maria

       When the new owner is ready, they run /pickup.
```

## Example 2 — pausing without a target

```
User: /handoff

Skill: [gathers state, asks the four questions]
       [body composed with target = "unassigned"]
       [post-handoff.sh 55 /tmp/handoff-body ""]

       Issue:    .../issues/55
       Comment:  .../issues/55#issuecomment-...
       Assignee: removed (@ygor); issue is now unassigned (or carries other assignees).

       When the new owner is ready, they run /pickup.
```

## Example 3 — re-claiming after a previous handoff

The convention: when you return to a feature you previously handed
off, run `/handoff @yourself` again. The new comment is the latest;
the assignee is right; `/pickup` will brief from your own previous
state.

```
User: /handoff @ygor

Skill: [gather, ask, post]
       Issue:    .../issues/55
       Comment:  .../issues/55#issuecomment-...
       Assignee: @maria → @ygor

       When the new owner is ready, they run /pickup.
```
