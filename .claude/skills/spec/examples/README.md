# `/spec` — example transcripts

## Example 1 — promote a discovery issue

```
User: /spec #42

Skill: Issue #42 reads "Worker timeouts on uploads > 50MB". Adjust the title
       now that we're moving to spec?

User: No, keep it.

Skill: [runs promote-discovery.sh] Issue #42 promoted: phase:discovery → phase:spec
       [computes slug "worker-timeouts-on-uploads-50mb", branch feat/42-...]
       [runs new-feature-branch.sh] feat/42-worker-timeouts-on-uploads-50mb
       [runs scaffold-spec.sh] docs/specs/042-worker-timeouts-on-uploads-50mb.md
       [reads issue body and src/worker/processor.ts]
       [drafts all 8 sections — Design proposes streaming concat with
        FFmpeg pipe, Alternatives sub-section listing chunked uploads as
        the rejected option because it requires API contract changes]
       [commits, pushes]
       [runs open-spec-pr.sh] PR #43

       Issue:  https://github.com/aurora-crista/pregacao-dev/issues/42
       Branch: feat/42-worker-timeouts-on-uploads-50mb
       Spec:   docs/specs/042-worker-timeouts-on-uploads-50mb.md
       PR:     https://github.com/aurora-crista/pregacao-dev/pull/43

       Review the drafted spec, edit as needed, then run /spec-review.
```

## Example 2 — fresh idea; size called out at review, not at /spec

```
User: /spec rewrite the worker as a proper queue with Redis, plus add
      retries, dead-letter handling, multi-tenancy, observability, and a
      new admin UI

Skill: That sounds like several features. Let me ask a couple of clarifying
       questions before opening anything.
       [asks for short title, type, scope]

User: Title: "Worker queue rewrite". Type: feature. Scope: just the queue
      and retry/DLQ; ignore admin UI and multi-tenancy for now.

Skill: [opens feature issue #51 with phase:spec,type:feature]
       [creates branch feat/51-worker-queue-rewrite]
       [scaffolds spec]
       [drafts all sections]
       [commits, pushes]
       [runs open-spec-pr.sh] PR #52

       Issue:  …/issues/51
       Branch: feat/51-worker-queue-rewrite
       PR:     …/pull/52

       Review the drafted spec, edit as needed, then run /spec-review.
       (If the spec is too big, /spec-review will return a `decompose`
       verdict and apply spec:requires-decomposition; you then run
       /decompose.)
```

## Example 3 — `chore/` branch from a `type:chore` issue

```
User: /spec #14

Skill: Issue #14 reads "Extend /spec to support fix/ and chore/ branches".
       Adjust the title now that we're moving to spec?

User: No, keep it.

Skill: [reads gh issue view #14 — labels: phase:discovery, type:chore]
       [resolves branch_type = chore from the type:chore label]
       [runs promote-discovery.sh] Issue #14 promoted: phase:discovery → phase:spec
       [computes slug "extend-spec-to-support-fix-and-chore-bra"]
       [runs new-feature-branch.sh 14 extend-spec-to-support-fix-and-chore-bra chore]
         chore/14-extend-spec-to-support-fix-and-chore-bra
       [runs scaffold-spec.sh 14 extend-spec-to-support-fix-and-chore-bra chore]
         docs/specs/014-extend-spec-to-support-fix-and-chore-bra.md
       [drafts all 8 sections]
       [commits, pushes]
       [runs open-spec-pr.sh 14 "Extend /spec to support fix/ and chore/ branches" chore]
         PR title: "chore: Extend /spec to support fix/ and chore/ branches (#14)"

       Issue:  https://github.com/aurora-crista/pregacao-dev/issues/14
       Type:   chore
       Branch: chore/14-extend-spec-to-support-fix-and-chore-bra
       Spec:   docs/specs/014-extend-spec-to-support-fix-and-chore-bra.md
       PR:     https://github.com/aurora-crista/pregacao-dev/pull/60

       Review the drafted spec, edit as needed, then run /spec-review.
```

The `--branch-type=<feat|fix|chore>` flag overrides label-based detection
when the label is missing, ambiguous, or disagrees with intent.

## Example 4 — `--options` forces alternatives

```
User: /spec --options add OGG support to the upload endpoint

Skill: [opens feature issue, branch, scaffolds spec]
       [drafts all sections]
       [Design section includes "Alternatives considered" sub-section
        even though confidence in the recommended approach is high]

       Issue:  …/issues/55
       Branch: feat/55-add-ogg-upload-support
       Spec:   docs/specs/055-add-ogg-upload-support.md
       PR:     …/pull/56

       Review the drafted spec, edit as needed, then run /spec-review.
```
