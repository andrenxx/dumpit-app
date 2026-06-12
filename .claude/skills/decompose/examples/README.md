# `/decompose` — example transcripts

## Example 1 — accepted 3-way split

```
User: /decompose

Skill: [resolves PR #56, parent issue #55]
       [verifies no spec:approved label]
       [load-spec.sh] docs/specs/055-worker-queue-rewrite.md
       [reads parent spec sections 2, 4, 5]
       [proposes 3-way split:]

       Proposed 3-way decomposition for #55 (Worker queue rewrite):

         (A) Redis-backed job queue
             Replace tmp/db/audio_uploads.json with a Redis-backed queue
             behind src/lib/queue.ts. No retry logic; just the transport.
             Slug: redis-backed-queue
             Owns: src/lib/queue.ts, src/worker/index.ts (poll → blocking pop)

         (B) Retry + dead-letter handling
             Layer retries (with backoff) and DLQ on top of (A).
             Depends on (A) shipped first.
             Slug: worker-retry-and-dlq
             Owns: src/worker/processor.ts (catch + retry), src/lib/queue.ts (dlq)

         (C) Observability — worker job logs API
             Expose worker job state via /api/worker/jobs for the dashboard.
             Independent of (B); can ship after (A).
             Slug: worker-jobs-observability-api
             Owns: src/app/api/worker/jobs/route.ts, src/worker/index.ts (emit logs)

       Accept this 3-way split? [yes / no]

User: yes

Skill: [for each child, in order:]
       [open-feature-issue.sh, captures #57, #58, #59]
       [link-sub-issue.sh 55 57] Linked: #57 is now a sub-issue of #55.
       [link-sub-issue.sh 55 58] Linked: #58 is now a sub-issue of #55.
       [link-sub-issue.sh 55 59] Linked: #59 is now a sub-issue of #55.
       [reads child #57 type:* label → "type:feature" → branch_type=feat]
       [create-detached-branch.sh 57 redis-backed-queue feat] feat/57-redis-backed-queue
       [reads child #58 type:* label → "type:feature" → branch_type=feat]
       [create-detached-branch.sh 58 worker-retry-and-dlq feat] feat/58-worker-retry-and-dlq
       [reads child #59 type:* label → "type:chore" → branch_type=chore]
       [create-detached-branch.sh 59 worker-jobs-observability-api chore] chore/59-worker-jobs-observability-api
       [composes children JSON]
       [rewrite-parent-spec.sh docs/specs/055-worker-queue-rewrite.md /tmp/decompose-children.json]
       Rewrote docs/specs/055-worker-queue-rewrite.md (backup at .pre-decompose.md).
       [git add, commit, push]
       [updates PR #56 body]

       Parent decomposed:
         Issue:   #55  https://.../issues/55
         PR:      #56  https://.../pull/56  (now containing the decomposition record)
         Spec:    docs/specs/055-worker-queue-rewrite.md
                  (backup at docs/specs/055-worker-queue-rewrite.pre-decompose.md)

       Children created (issue + sub-issue link + branch on origin):
         #57  Redis-backed job queue
              branch: feat/57-redis-backed-queue
         #58  Retry + dead-letter handling
              branch: feat/58-worker-retry-and-dlq
         #59  Worker jobs observability API
              branch: feat/59-worker-jobs-observability-api

       Next steps:
         - Re-run /spec-review against PR #56 to apply spec:approved on
           the decomposition record.
         - For each child, run /spec <child-number> to scaffold the spec
           on its branch and open its draft PR.
         - Children proceed independently through the standard flow.
```

## Example 2 — refusal because spec:approved is already on the PR

```
User: /decompose

Skill: [resolves PR #56]
       Error: PR #56 already carries spec:approved. Decomposition would
       rewrite the spec body and invalidate that approval mid-flight.

       Two options:
         1. Run /spec-review now to make sure the current approval is
            still warranted; if it is, decomposition is unnecessary.
         2. Comment on PR #56 explaining you intend to decompose, then
            ask the person who approved to remove the label. After that,
            re-run /decompose.

       Stopped. No mutation.
```

## Example 3 — rejected proposal

```
User: /decompose

Skill: [proposes a 4-way split]
       Accept? [yes / no]

User: no, I think 3 is better — group B and C together as a single
      observability + retry slice.

Skill: Stopped. No GitHub mutation has happened. Re-run /decompose
       and explore a different split, or accept the 3-way variant by
       editing the proposal manually before continuing.
```
