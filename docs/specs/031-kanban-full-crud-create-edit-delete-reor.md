# Spec 031 — Kanban full CRUD — create, edit, delete, reorder, empty state, position fix

| Field    | Value                                                                              |
| -------- | ---------------------------------------------------------------------------------- |
| Issue    | [#31](https://github.com/andrenxx/dumpit/issues/31)                                |
| Branch   | `feat/31-kanban-full-crud-create-edit-delete-reor`                                 |
| Status   | Decomposed — tracking children                                                       |
| Type     | feature                                                                            |

## 1. Context

This spec was decomposed by `/decompose` because the original scope was too large for a single PR. The original body has been preserved at this file with the suffix `.pre-decompose.md` for recovery; the canonical record going forward is the table of children below.

## 2. Children

Each child has an issue and a branch on origin. PRs are opened when a contributor runs `/spec <child-number>` on the child branch.

| # | Title | Branch |
| - | ----- | ------ |
| #33 | Fix dump position conflict when existing tasks present | `fix/33-fix-dump-position-conflict-when-existing` |
| #34 | Kanban CRUD — create, edit, delete with undo, reorder, empty state | `feat/34-kanban-crud-create-edit-delete-with-undo` |

### Summaries

- **#33 Fix dump position conflict when existing tasks present.** Bug fix: query MAX position before inserting dump tasks
- **#34 Kanban CRUD — create, edit, delete with undo, reorder, empty state.** Feature: full Kanban interaction layer
## 2.5 Validation strategy (inherited from pre-decompose)

Run `npm run build` (passes). Open `http://localhost:5173` (Vite + Wrangler proxy):

1. **Create** — click "Nova task" in any column, type a title, pick a priority, submit → card appears in that column; reload confirms DB persistence.
2. **Edit** — tap a card → bottom sheet slides up with correct title/priority; edit and save → card updates instantly.
3. **Delete + undo** — open edit sheet, click Excluir → card disappears, undo toast appears for 4 s; click Desfazer → card comes back. Let a second delete expire → card stays gone after reload.
4. **Reorder** — drag card within a column to a new position → order persists after reload.
5. **Empty state** — delete all tasks in a column → empty state message appears.
6. **Position fix** — with tasks already in `a_fazer`, do a new dump → new tasks appear at the bottom, existing order unchanged.

## 3. Acceptance (parent-level)

- [ ] Each child has been picked up via `/spec <child>` and progressed through the standard flow.
- [ ] All children listed above are merged.
- [ ] Decomposition record (this spec) ships as a small docs PR through the normal flow.

## 4. Risks and Rollout

Decomposition itself is a low-risk operation; the substantive risks live in each child spec. Rollout: each child proceeds independently through the standard /spec → /implement → /code-review → /ship loop. Sibling order is the human's call (no automated blocking).
