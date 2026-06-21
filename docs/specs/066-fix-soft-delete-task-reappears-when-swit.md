# Spec 066 — Fix soft delete: task reappears when switching tabs

| Field  | Value |
|--------|-------|
| Issue  | [#66](https://github.com/andrenxx/dumpit/issues/66) |
| Branch | `fix/66-fix-soft-delete-task-reappears-when-swit` |
| Status | Draft — awaiting review |
| Type   | bug |

## 1. Context

When a task is deleted, `KanbanBoard` removes it from local state and queues
the `deleted_at` DB write for 4 seconds (undo window). If the user switches
browser tabs and returns during that window, `TasksPage` re-fetches from
Supabase — which returns the task because `deleted_at` is still null — and it
reappears in the board. The undo handler also becomes stale after a re-fetch.

## 2. Goals

1. A deleted task never reappears on tab switch, page refresh, or any
   Supabase re-fetch during the undo window.
2. Undo within 4 seconds correctly restores the task visually and in the DB.
3. Deleting multiple tasks in quick succession works without state corruption.

## 2.5 Validation strategy

Manual browser test:
- Delete → switch tab → return: task must not reappear.
- Delete → click Desfazer within 4s: task restored at correct position.
- Delete two tasks quickly: both stay gone; each toast's undo is independent.

## 3. Non-goals

- Real-time sync / Supabase Realtime subscriptions.
- Changing the 4-second undo duration.
- Handling network errors on the undo write (silent fail is acceptable for V1).

## 4. Design

**Core change:** write `deleted_at = now()` to the DB immediately on delete
(not after 4s). Undo writes `deleted_at = null` to restore the row. Because
`TasksPage` already filters `.is('deleted_at', null)`, any re-fetch during
the undo window will correctly exclude the deleted task.

### New handleDelete flow

```
1. Remove task from local state optimistically.
2. Write deleted_at = now() to DB immediately (fire-and-forget).
3. Show toast with "Desfazer" action for 4s.
4. On undo click:
   a. Re-insert task into local state at its original position.
   b. Write deleted_at = null to DB (fire-and-forget).
```

`pendingDeleteRef` is simplified: no longer holds a `timeout` for the DB
write — only holds `{ id, task }` so the undo handler can identify which task
to restore. The timeout is kept only to clear the ref after 4s (so a stale
undo can't fire).

### Multiple deletions

When a second delete arrives while a first is pending, clear `pendingDeleteRef`
(disabling the first undo) and proceed normally. The first task is already
deleted in the DB.

### Undo position restoration

Keep the existing splice-by-position logic: find the first task in the same
column with `position >= taskToDelete.position` and insert before it; if none,
append.

## 5. Files

| Path | Action | Notes |
|------|--------|-------|
| `src/components/tasks/KanbanBoard.jsx` | Modify | Rewrite `handleDelete` — immediate DB write, undo calls `deleted_at = null`, simplify `pendingDeleteRef` |

## 6. Acceptance

- [ ] Delete task → switch tab → return: task stays gone
- [ ] Delete task → Desfazer within 4s: task restored in correct position
- [ ] Delete two tasks quickly: both gone; each undo is independent
- [ ] No regression on drag-and-drop, create, edit, reorder

## 7. Risks

| Risk | Mitigation |
|------|------------|
| Undo DB write fails silently | Task restored in UI but deleted in DB — log error; acceptable for V1 |
| Immediate DB write adds latency before showing toast | Write is fire-and-forget (no await before UI update) — no UX impact |

## 8. Rollout

Single commit touching only `KanbanBoard.jsx`.
