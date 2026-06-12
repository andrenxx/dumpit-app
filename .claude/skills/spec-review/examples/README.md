# `/spec-review` — example transcripts

## Example 1 — clean pass, label applied

```
User: /spec-review

Skill: [resolves PR from current branch: #43]
       [load-spec.sh returns docs/specs/042-worker-timeouts-on-uploads-50mb.md]
       [spawns Explore subagent with spec, issue body, checklist]

       ✅ Pass
       - 1. Goals achievable inside this PR — 4 goals, each maps to a
         specific helper or section.
       - 2. Non-goals explicit — section 3 lists 5 non-goals including
         "no observability rewrite".
       - 3. Design grounded — section 4 proposes streaming concat with
         FFmpeg pipe; alternatives sub-section lists chunked uploads and
         worker pool with rejection rationale.
       - 4. Files match Design — every file in section 5 is referenced
         in section 4.
       - 5. Acceptance objective — 6/6 criteria are yes/no checks.
       - 6. Risks honest — 4 risks with concrete mitigations.
       - 7. Rollout concrete — 3 commits planned, dry run defined.
       - 8. Single-branch fit — superseded by item 12.
       - 9. Internal consistency — all section refs resolve.
       - 10. No phase leakage — Phase 1.2 work is explicitly non-goal.
       - 12. Decomposition analysis — one chunk surfaces (worker
         streaming concat); no candidate B exists.

       **Decomposition verdict:** single

       Recommended commit plan: (1) worker streaming concat, (2) tests,
       (3) docs.

       ⚠️ Concerns
       (none)

       ❌ Blockers
       (none)

       All checks passed. Apply spec:approved label?
       [AskUserQuestion, default yes]

User: yes

Skill: [runs apply-spec-approved.sh 43 "10/10 pass, 0 concerns, 0 blockers"]

       spec:approved label applied to PR #43: https://github.com/aurora-crista/pregacao-dev/pull/43
       Next step: implement on the same branch, then run /code-review.
```

## Example 2 — concerns but no blockers, user defers

```
Skill: ✅ Pass: 8 items
       ⚠️ Concerns:
         - 7. Rollout concrete — section 8 step 4 says "address findings"
           without specifying what counts as a finding.
       ❌ Blockers: (none)

       Concerns above are non-blocking. Apply spec:approved despite them,
       or address first? [default no]

User: no

Skill: Report shown. spec:approved not applied. Address concerns, then
       run /spec-review again.
```

## Example 3 — blocker, no label prompt

```
Skill: ✅ Pass: 6 items
       ⚠️ Concerns: 1 item
       ❌ Blockers:
         - 3. Design grounded — section 4.2 reads "TBD: figure out
           transport layer". Spec needs concrete proposal.

       Address blockers, then run /spec-review again.
       [No label prompt; no approval comment.]
```
