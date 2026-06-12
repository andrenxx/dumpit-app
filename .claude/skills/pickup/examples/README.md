# `/pickup` — example transcripts

## Example 1 — clean pickup with handoff present

```
User: /pickup

Skill: [resolves PR #56, issue #55]
       [load-latest-handoff.sh 55 > /tmp/handoff-comment.md]
       [reassigns issue #55 → @me]
       [git fetch + git switch feat/55-add-ogg-upload-support]
       [reads handoff, spec, diff; composes briefing]

       Picked up issue #55 on branch feat/55-add-ogg-upload-support.

       Handoff context (from latest /handoff comment):
         Author:           @maria
         Posted:           2026-04-30 14:22 UTC
         Last commit:      a1b2c3d feat(#55): accept OGG uploads via mime allowlist
         Spec progress:    2 of 3 file groups complete; worker ffmpeg branch outstanding.
         Open decisions:   transcode location — sync route vs. async worker; previous owner leaning async.
         Gotchas:          ffmpeg-static lacks OGG codecs by default — needs --enable-libvorbis.
         Suggested next:   Add worker branch for OGG → MP3 in src/worker/ffmpeg.ts; verify ffmpeg build issue first.

       What I would do next (deterministic):
         - PR has spec:approved only. Run /implement (or continue) and then /code-review.
```

## Example 2 — refusal: no handoff comment

```
User: /pickup

Skill: [resolves PR #56, issue #55]
       [load-latest-handoff.sh 55]
       Error: no handoff comment found on issue #55
              (no comment starts with '### 🔁 Handoff —')

       Stopped. The issue has no handoff comment. Either:
         - Ask the previous owner to run /handoff,
         - Or read the spec and PR yourself, then post a /handoff
           @yourself once you have ramped up.
       Did NOT reassign the issue.
```

## Example 3 — re-pickup after a fresh handoff

If the previous owner returned to the feature and posted a new
`/handoff @<current-owner>`, running `/pickup` again surfaces the
newer briefing. The state machine on PR labels still applies; the
deterministic next-step hint reflects the latest gates.
