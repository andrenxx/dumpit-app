# Spec 039 — Fix task deletion flush on unmount

| Field    | Value                                                                                 |
| -------- | ------------------------------------------------------------------------------------- |
| Issue    | [#39](https://github.com/andrenxx/dumpit/issues/39)                                   |
| Branch   | `fix/39-task-deletion-flush-on-unmount`                                               |
| Status   | spec:approved                                                                          |
| Type     | bug                                                                                    |

## 1. Context

`KanbanBoard.jsx` implements a 4-second undo window for task deletion. The optimistic UI removal is immediate; the actual DB soft-delete (`deleted_at`) is deferred inside a `setTimeout`. A `pendingDeleteRef` tracks the in-flight deletion.

**Bug**: when the user navigates away from TasksPage (e.g., to DumpPage) within the 4-second window, `KanbanBoard` unmounts. The `pendingDeleteRef` is local to the component instance. Because there is no `useEffect` cleanup, the deferred DB update is never flushed on unmount. The timer callback still fires 4 seconds later (closures survive unmount), BUT if `TasksPage` has already remounted and refetched by then, the "deleted" task reappears in the list (because `deleted_at` was still null at fetch time).

This also explains the related report "dump with active tasks doesn't work correctly": the user deletes tasks, quickly navigates to DumpPage, submits a dump, and navigates back. `TasksPage` remounts and fetches before the 4-second timer fires — deleted tasks reappear alongside new dump tasks.

## 2. Goals

- When `KanbanBoard` unmounts with a pending deletion, immediately fire the soft-delete DB update (don't wait for the 4-second timer).
- Undo must still work while the user stays on TasksPage for the full 4-second window.
- No behavior changes to the happy path (delete, wait, task is gone).

## 2.5 Validation strategy

1. Delete a task on TasksPage.
2. Immediately navigate to DumpPage (within 4 seconds).
3. Navigate back to TasksPage.
4. Confirm the deleted task does NOT reappear.
5. Repeat but click "Desfazer" before navigating — confirm the task IS restored.
6. `npm run build` exits 0.

## 3. Non-goals

- Changing the 4-second undo window duration or UX.
- Adding error handling to the flush (fire-and-forget is acceptable; failures are silent as before).
- Adding real-time subscriptions to `TasksPage`.

## 4. Design

Add a `useEffect` with an empty dependency array to `KanbanBoard`. The cleanup function fires on unmount and flushes any pending deletion immediately.

```js
useEffect(() => {
  return () => {
    if (pendingDeleteRef.current) {
      clearTimeout(pendingDeleteRef.current.timeout)
      supabase
        .from('tasks')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', pendingDeleteRef.current.id)
      pendingDeleteRef.current = null
    }
  }
}, [])
```

The cleanup cannot `await` (React cleanup functions are synchronous), but the Supabase JS client will queue and send the request regardless. The timing window between the cleanup firing and `TasksPage` mounting + fetching is the page transition animation (~220ms) plus the fetch round-trip — the DB write is issued first, so in practice the task will be deleted before the fetch returns.

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `src/components/tasks/KanbanBoard.jsx` | modify | Add `useEffect` cleanup to flush pending delete on unmount |

## 6. Acceptance

- [ ] Delete a task and navigate away within 4 seconds — task does not reappear.
- [ ] Delete a task and click "Desfazer" within 4 seconds — task is restored.
- [ ] Delete a task and wait 5 seconds — task is gone (timer flushed it).
- [ ] Dump new tasks after deleting some — deleted tasks don't reappear in TasksPage.
- [ ] `npm run build` exits 0.

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| Cleanup fires but DB write arrives after TasksPage fetch | Narrow window (~220ms animation + fetch latency). Acceptable; the alternative (synchronous deletion, no undo) is worse UX. |
| `pendingDeleteRef.current = null` in cleanup after unmount | Assigning to an unmounted ref is a no-op in React; no error. |

## 8. Rollout

Single commit:

1. `fix(#39): flush pending task deletion on KanbanBoard unmount`
