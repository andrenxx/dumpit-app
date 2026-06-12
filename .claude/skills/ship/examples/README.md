# `/ship` — example transcripts

## Example 1 — clean ship

```
User: /ship

Skill: [resolves PR #56, issue #55]
       [verify-ready-to-ship 56] both labels present
       [gh pr ready 56]
       [gh pr merge 56 --squash --subject "<pr-title>" --body "Closes #55"] merged
       [delete-remote-branch.sh feat/55-add-ogg-upload-support] remote branch gone
       [transition-issue-label.sh 55 phase:review phase:shipped]
       [cleanup-worktree.sh /Users/.../pregacao-dev-add-ogg feat/55-add-ogg-upload-support /Users/.../pregacao-dev]
       Cleanup: removed worktree /Users/.../pregacao-dev-add-ogg and local branch feat/55-add-ogg-upload-support.

       Merged:  https://github.com/aurora-crista/pregacao-dev/pull/56
       Issue:   https://github.com/aurora-crista/pregacao-dev/issues/55  (now phase:shipped, closed)
       Cleanup: removed worktree and local branch.

       If your shell is now in a removed worktree, cd /Users/.../pregacao-dev to continue.
```

## Example 2 — gate refusal

```
User: /ship

Skill: [verify-ready-to-ship 56]
       Missing label: code:approved — run /code-review first.
       (exit 1)

       Stopped. Apply the missing label first.
```

## Example 3 — running from the main checkout (cleanup skipped safely)

```
User: /ship

Skill: [merge succeeds, issue transitions]
       [cleanup-worktree.sh /Users/.../pregacao-dev feat/N-slug /Users/.../pregacao-dev]
       Error: refusing to remove the main checkout at /Users/.../pregacao-dev

       Merged:  https://github.com/aurora-crista/pregacao-dev/pull/N
       Issue:   ... (now phase:shipped)
       Cleanup: skipped (main checkout). The remote branch was deleted; clean
                up the local branch with: git branch -D feat/N-slug
```
