# Skills

Versioned skills that drive this project's spec-driven workflow. Cloning the
repo gives you the full set; running any skill goes through Claude Code (or
any AGENTS.md-aware runtime).

The full reasoning is in
[ADR 0001](../../docs/architecture/decisions/0001-spec-driven-workflow.md);
the human-facing flow is in [`CONTRIBUTING.md`](../../CONTRIBUTING.md).

## Catalog

### Phase 1.1 — Planning skills

| Skill           | Purpose                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------- |
| `/discover`     | Turn a pain or vague idea into a `phase:discovery` GitHub issue, in 5 forcing questions.      |
| `/spec`         | Turn a discovery (or fresh idea) into an issue + branch + drafted spec proposal + draft PR.   |
| `/spec-review`  | Fresh-context audit of a spec PR; on clean pass, asks to apply `spec:approved` label.         |

### Phase 1.2.a — Execution skills

| Skill           | Purpose                                                                                            |
| --------------- | -------------------------------------------------------------------------------------------------- |
| `/implement`    | Drive implementation against an approved spec; run sanity gates; commit incrementally.             |
| `/code-review`  | Fresh-context audit of the diff; manages `spec:approved` invalidation; on clean pass asks to apply `code:approved`. |
| `/ship`         | Gate on both labels, mark ready, rebase-merge, transition issue to `phase:shipped`, clean up worktree. |

### Phase 1.2.b — Utility skill

| Skill           | Purpose                                                                                            |
| --------------- | -------------------------------------------------------------------------------------------------- |
| `/adr`          | Scaffold a new ADR file with metadata pre-filled; optionally draft Context/Decision/Consequences from a description. The new ADR rides on the current branch. |

### Phase 1.2.c — Utility skill

| Skill           | Purpose                                                                                            |
| --------------- | -------------------------------------------------------------------------------------------------- |
| `/status`       | Read-only "what am I working on, and what's the next action?" view. Lists open issues by phase and open PRs with gate labels, plus deterministic next-action hints. |

### Phase 2 — Collaboration

| Skill           | Purpose                                                                                                                                |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `/handoff`      | Capture in-flight work state into a structured GitHub issue comment with a marker, optionally reassigning the issue to another human. |
| `/pickup`       | Read the latest handoff comment, reassign to `@me`, switch to the branch, and brief the new owner from comment + spec + diff.          |

### Phase 3 — Decomposition

| Skill           | Purpose                                                                                            |
| --------------- | -------------------------------------------------------------------------------------------------- |
| `/decompose`    | Turn a too-big draft spec into N child sub-issues (each linked to the parent), each with their own branch and placeholder draft PR; rewrites the parent spec into a tracker. Children proceed via the normal flow. |

## Layout convention

```
.claude/skills/<name>/
├── SKILL.md           # frontmatter + workflow steps
├── helpers/           # deterministic shell scripts
│   └── *.sh
└── examples/          # transcript-style examples
    └── README.md
```

`_shared/helpers/` holds helpers reused across skills.
[Contract for all helpers](_shared/helpers/README.md).

## Philosophy

- **Fat skills.** Each skill bundles deterministic helpers plus an
  opinionated `SKILL.md` workflow. The agent improvises within structure,
  not from a blank prompt.
- **Helpers do not call LLMs.** Anything LLM-driven lives in `SKILL.md`.
- **Skills do not approve on the human's behalf.** They prepare, propose,
  and ask. The human decides.
- **Failures degrade gracefully.** When a helper fails, the skill explains
  why in plain language and falls back to instructing the human to do the
  manual step.
