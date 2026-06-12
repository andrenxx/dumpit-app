# Contributing

This project uses **Spec-Driven Development** with **GitHub Issues as the
source of truth** for feature state. The full reasoning is in
[ADR 0001](docs/architecture/decisions/0001-spec-driven-workflow.md).

## First-time setup

```bash
cp .env.example .env.local      # fill in your credentials
npm install                     # install deps
npm run dev                     # Vite dev server on :5173
vercel dev                      # frontend + Vercel Functions on :3000
```

The app reads environment variables from `.env.local`. If `npm run dev`
fails referencing a missing key, re-copy from `.env.example`.

## The loop

```
   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
   │  discovery   │ →  │     spec     │ →  │ implementing │
   └──────────────┘    └──────────────┘    └──────────────┘
         (optional)                                │
                                                   ▼
                                            ┌──────────────┐
                                            │    review    │
                                            └──────────────┘
                                                   │
                                                   ▼
                                            ┌──────────────┐
                                            │   shipped    │
                                            └──────────────┘
```

Each box is a label on the issue. There is no parallel state file — the
issue is the live state.

## Skills (the canonical entry points)

The full workflow loop is automated by versioned skills under
[`.claude/skills/`](.claude/skills/). Run them via Claude Code:

| Skill               | What it does                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| `/discover`         | Five forcing questions → discovery issue with `phase:discovery`.                                            |
| `/spec`             | Discovery (or fresh idea) → feature issue + branch + drafted spec + draft PR.                               |
| `/spec-review`      | Fresh-context audit → on clean pass, asks to apply `spec:approved`.                                         |
| `/implement`        | Drives code against the approved spec; runs sanity gates; commits incrementally.                            |
| `/code-review`      | Fresh-context audit of the diff; on clean pass applies `code:approved`.                                     |
| `/ship`             | Refuses without both gate labels; rebase-merges, transitions `phase:shipped`, cleans up.                   |
| `/adr`              | Scaffold a new architectural decision record on the current branch.                                         |
| `/status`           | Read-only "what am I working on?" view.                                                                     |
| `/handoff`          | Capture in-flight state into a structured GitHub issue comment.                                             |
| `/pickup`           | Read the latest handoff, reassign to `@me`, switch to the branch, brief on the feature.                    |
| `/decompose`        | Turn a too-big draft spec into N child sub-issues, each with their own branch and placeholder PR.           |

### Issue lifecycle

```
   ┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
   │   phase:spec     │  →→→  │ phase:implementing│  →→→  │   phase:review   │  →→→  │  phase:shipped   │
   └──────────────────┘       └──────────────────┘       └──────────────────┘       └──────────────────┘
        opened by                  promoted by                promoted by                merged by
        /spec                      /implement                 /code-review               /ship
```

`phase:discovery` sits one step upstream when the loop starts from
`/discover`. Transitions are adjacent-only.

## Step by step

### 1. Open an issue

Use a template:

- **`feature.yml`** — for new functionality or non-trivial changes.
- **`discovery.yml`** — when the problem is still vague.

Trivial changes (typo fix, dep bump) do not need an issue.

### 2. Draft a spec

Copy `docs/specs/_template.md` to `docs/specs/NNN-<slug>.md` where:

- `NNN` is the issue number, zero-padded to **3 digits** (`007`, `042`).
- `<slug>` is short kebab-case from the issue title.

Open a PR with just the spec, get it reviewed before writing code.

#### Trivial fast-track

When **both** hold: **≤ 10 lines changed** AND **≤ 2 files touched** —
the issue body is the spec and the PR description is the self-audit.
Paste this block into the PR:

```
## Trivial fast-track

- [ ] Diff is within threshold (<lines> lines, <files> files).
- [ ] No new abstraction, public API, or schema introduced.
- [ ] No new dependency added.
- [ ] No ADR required.
- [ ] Behavior change: <one sentence>
- [ ] Risks: <one sentence or "none">

Closes #N
```

### 3. Implement

- Branch: `feat/N-<slug>` (or `fix/`, `chore/`).
- Commit using Conventional Commits with the issue ref:

  ```
  feat(#12): add kanban drag-and-drop persistence
  fix(#15): resolve stripe webhook signature validation
  ```

### 4. Open the PR

- Title: `feat: <message> (#N)`.
- Body includes `Closes #N`.

### 5. Ship

On merge, the issue closes automatically via `Closes #N`.

## Conventions reference

| Concern    | Convention                                               |
| ---------- | -------------------------------------------------------- |
| Spec file  | `docs/specs/NNN-<slug>.md` (3-digit issue number).       |
| ADR file   | `docs/architecture/decisions/NNNN-<title>.md` (own 4-digit seq). |
| Branch     | `feat/N-<slug>`, `fix/N-<slug>`, `chore/N-<slug>`.       |
| Commit     | Conventional Commits with `(#N)` scope.                  |
| PR title   | Mirrors commit format with `(#N)` suffix.                |
| PR body    | Includes `Closes #N`.                                    |
| Phase      | Exactly one `phase:*` label at a time.                   |

## Labels

The full label set is in [`.github/labels.yml`](.github/labels.yml).
Apply via:

```bash
while read -r line; do
  name=$(echo "$line" | yq '.name')
  color=$(echo "$line" | yq '.color')
  desc=$(echo "$line" | yq '.description')
  gh label create "$name" --color "$color" --description "$desc" --force
done < <(yq '.labels[] | @json' .github/labels.yml)
```

## Where things live

```
docs/
├── specs/                          ← versioned feature specs
│   ├── _template.md
│   └── NNN-<slug>.md
└── architecture/
    └── decisions/                  ← versioned ADRs
        ├── _template.md
        └── NNNN-<title>.md

.github/
├── ISSUE_TEMPLATE/
│   ├── feature.yml
│   └── discovery.yml
└── labels.yml

CLAUDE.md                           ← AI agent context (stack + conventions)
AGENTS.md                           ← non-Claude agent context
CONTRIBUTING.md                     ← this file
```
