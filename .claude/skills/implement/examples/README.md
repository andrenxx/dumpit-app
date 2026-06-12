# `/implement` — example transcripts

## Example 1 — clean run on a small feature

```
User: /implement

Skill: [current-pr.sh] PR #56
       [load-spec.sh 56] docs/specs/056-add-ogg-upload-support.md
       [verify-spec-approved.sh 56] OK
       [transition-issue-label.sh 55 phase:spec phase:implementing] Issue #55: phase:spec → phase:implementing

       Plan: 2 chunks
         A. extend src/lib/validation.ts + src/app/api/process-audio/route.ts (mime allowlist)
         B. add ffmpeg branch in src/worker/ffmpeg.ts for OGG → MP3 normalization

       --- Chunk A ---
       [edits validation.ts and route.ts]
       [run-sanity-gates.sh]
       ▶ npm run lint
         (no errors)
       ▶ npm run build
         (build successful)
       [git add src/lib/validation.ts src/app/api/process-audio/route.ts]
       [git commit] feat(#55): accept OGG uploads via mime allowlist

       --- Chunk B ---
       [edits ffmpeg.ts]
       [run-sanity-gates.sh] all green
       [git add src/worker/ffmpeg.ts]
       [git commit] feat(#55): normalize OGG to MP3 in worker pipeline

       [git push]

       Issue:   https://github.com/aurora-crista/pregacao-dev/issues/55 (now phase:implementing)
       PR:      https://github.com/aurora-crista/pregacao-dev/pull/56
       Branch:  feat/55-add-ogg-upload-support
       Commits: feat(#55): accept OGG uploads via mime allowlist
                feat(#55): normalize OGG to MP3 in worker pipeline

       Next step: run /code-review when implementation feels done.
```

## Example 2 — sanity gate fails

```
Skill: --- Chunk A ---
       [run-sanity-gates.sh]
       ▶ npm run lint
         /src/lib/validation.ts:42:5  error  'mimeAllowlist' is assigned a value but never used  no-unused-vars
       ✗ gate 'lint' failed

       Aborted. Fix the issue and re-run /implement (it resumes from the failing chunk).
       The commit was NOT made.
```

## Example 3 — refusal: spec not approved

```
User: /implement

Skill: [current-pr.sh] PR #56
       [verify-spec-approved.sh 56]
       Error: PR #56 does not carry spec:approved (current PR labels: <none>)
       Run /spec-review first to apply the label.

       Stopped. Run /spec-review against PR #56 first.
```
