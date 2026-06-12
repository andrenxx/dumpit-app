# `/status` — example transcripts

## Example 1 — typical mid-feature view

```
User: /status

Skill: [query-my-work.sh > /tmp/status.json]
       [format-status.sh /tmp/status.json]

       Status for @me — aurora-crista/pregacao-dev

       Issues (3 open)
         phase:spec
           #14   Extend /spec to support fix/ and chore/ branches
                 → run /spec to start drafting
         phase:implementing
           #28   Add OGG support to upload endpoint
                 → spec was edited after approval; run /spec-review to re-confirm
         phase:review
           #34   Refactor TTS factory to support concurrent providers
                 → run /ship to merge

       PRs (2 open)
         #29  (draft)  feat: add OGG support (#28)
              labels: spec:approved
              → run /implement (or continue) and then /code-review
         #35  (ready)  feat: refactor TTS factory (#34)
              labels: spec:approved, code:approved
              → run /ship to merge
```

The hint for issue #28 says "spec was edited after approval" because
the linked PR (#29) shows `spec:approved` was invalidated; the issue's
own phase label says `phase:implementing`, which the state machine
defers to the PR state for issues that have a linked PR.

## Example 2 — empty (nothing in flight)

```
User: /status

Skill: Status for @me — aurora-crista/pregacao-dev

       Issues (0 open)
         (none)

       PRs (0 open)
         (none)
```

## Example 3 — viewing someone else

```
User: /status @ygor

Skill: Status for ygor — aurora-crista/pregacao-dev

       Issues (1 open)
         phase:implementing
           #42  Worker timeouts on > 50MB uploads
                → implementation in progress; run /code-review when done

       PRs (0 open)
         (none)
```

The skill does not validate that `ygor` exists — if `gh` returns no
results, the report shows zero items rather than an error.
