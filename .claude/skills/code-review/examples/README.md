# `/code-review` — example transcripts

## Example 1 — clean pass

```
User: /code-review

Skill: [resolves PR #56, spec docs/specs/056-add-ogg-upload-support.md]
       [check-spec-touched 56 docs/specs/056-add-ogg-upload-support.md] (no edits)
       [spawns Explore subagent with diff + spec + checklist]

       ✅ Pass
       - 1. Diff stays inside section 5 — both changed files appear in the spec.
       - 2. Goals met — Goal 1 fulfilled by validation.ts mime allowlist; Goal 2 by ffmpeg.ts branch.
       - 3. No drive-by edits.
       - 4. No new console.log.
       - 5. No hardcoded secrets.
       - 6. Sanity gates ran clean (last commit: lint + build green per /implement output).
       - 7. No new shell helpers in this diff.
       - 8. Spec untouched.
       - 9. Acceptance reachable.
       - 10. No phase-leakage.

       ⚠️ Concerns: (none)
       ❌ Blockers: (none)

       All checks passed. Apply code:approved? [default yes]

User: yes

Skill: [apply-code-approved.sh 56 "10/10 pass, 0 concerns, 0 blockers"]
       [transition-issue-label.sh 55 phase:implementing phase:review]

       PR:    https://github.com/aurora-crista/pregacao-dev/pull/56  (code:approved: yes; spec:approved invalidated: no)
       Issue: https://github.com/aurora-crista/pregacao-dev/issues/55  (now phase:review)

       Next step: run /ship.
```

## Example 2 — spec was edited mid-implementation

```
Skill: [check-spec-touched 56 ...] returned 2 commits since spec:approved
       [invalidate-spec-approval.sh 56 ...]

       ⚠️ Spec was edited after approval; spec:approved removed. Code review
       continues against the current spec; run /spec-review before /ship to
       re-approve.

       [audit runs against the updated spec]
       ✅ 8 pass, ⚠️ 1 concern, ❌ 0 blockers

       Concerns above are non-blocking. Apply code:approved despite them, or
       address first? [default no]

User: yes

Skill: [code:approved applied]
       [issue → phase:review]

       PR:    https://...  (code:approved: yes; spec:approved invalidated: yes)

       Next step: run /spec-review to re-confirm the spec, then /ship.
```

## Example 3 — blocker

```
Skill: ✅ 7 pass, ⚠️ 1 concern, ❌ 2 blockers
       Blockers:
         - 1. Diff stays inside section 5 — `src/lib/random-helper.ts` is
           in the diff but not in the spec's Files table.
         - 4. No new console.log — `src/worker/processor.ts:88`
           introduces `console.log("hi")` left from debugging.

       Address blockers, then run /code-review again.
       [No label prompt; issue label not transitioned.]
```
