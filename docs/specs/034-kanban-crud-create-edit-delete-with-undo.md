# Spec 034 — Kanban CRUD — create, edit, delete with undo, reorder, empty state

| Field    | Value                                                                              |
| -------- | ---------------------------------------------------------------------------------- |
| Issue    | [#34](https://github.com/andrenxx/dumpit/issues/34)                                |
| Branch   | `feat/34-kanban-crud-create-edit-delete-with-undo`                                 |
| Status   | Draft — awaiting review                                                            |
| Type     | feature                                                                            |
| Parent   | Decomposed from spec #031                                                          |

## 1. Context

The Kanban board renders correctly (spec #24) but has no interaction layer. `NewTaskButton` has no click handler. There is no way to edit or delete a task. Dragging within a column does not persist position. Empty columns show nothing. This spec delivers the full CRUD surface so the board is usable end-to-end.

## 2. Goals

1. **Create** — `NewTaskButton` opens an inline form; submitting creates the task in the correct column and persists it in the DB.
2. **Edit** — tapping a card opens a bottom sheet to edit title and priority; saving persists.
3. **Delete with undo** — delete button in the edit sheet removes the task optimistically and shows a 4-second undo toast; the DB write is deferred until the toast auto-dismisses.
4. **Reorder within column** — dragging a card within the same column reorders the list and persists positions in the DB.
5. **Empty state** — each column shows "Nada aqui ainda" when it has no tasks.

## 2.5 Validation strategy

Open `http://localhost:5173` (Vite + Wrangler proxy on port 8788):

1. **Create** — click "Nova task" in any column → inline form appears; type title, pick priority, submit → card appears in that column; reload confirms DB persistence.
2. **Edit** — tap a card → bottom sheet slides up with correct title/priority; edit and save → card updates; reload confirms.
3. **Delete + undo** — open edit sheet, click Excluir → card disappears, undo toast for 4s; click Desfazer → card comes back. Let a second delete expire → card stays gone after reload.
4. **Reorder** — drag card within a column → order persists after reload.
5. **Empty state** — delete all tasks in a column → "Nada aqui ainda" appears.

## 3. Non-goals

- Position fix in `parse-tasks.js` (tracked in fix #33).
- Bulk actions (mark all as done).
- Task due dates, subtasks, comments.
- Filters or search.
- Keyboard navigation / accessibility hardening.
- Touch-swipe-to-delete gesture.

## 4. Design

### 4.1 Create — inline form in NewTaskButton

`NewTaskButton` receives `columnStatus` and `onCreateTask` props. Local `editing` state toggles between the dashed button and an inline form:

- `textarea rows={1}`, autofocus, max 200 chars.
- Three priority pill buttons (Alta / Média / Baixa), default `media`.
- Submit on Enter or "Adicionar" button; cancel on Escape or blur-outside.
- On submit: call `onCreateTask({ title, priority })` → `KanbanBoard` handles insert.
- Optimistic: board appends with a temp id; DB insert resolves the temp id.
- Position: `grouped[columnStatus].length` (appended to column end).

### 4.2 Edit — TaskEditSheet bottom sheet

New file `src/components/tasks/TaskEditSheet.jsx`:

- Framer Motion: `y: '100%' → y: 0`, `rounded-t-[24px]`, `glass-surface-strong glass-inset-highlight`.
- Backdrop: `rgba(0,0,0,0.3)` + `backdropFilter: blur(6px)`; click closes without saving.
- Fields: title textarea (autofocus, max 200 chars) + priority pills.
- Actions: **Salvar** (calls `onSave`) and **Excluir** (calls `onDelete`).

`TaskCard` receives `onEdit` prop; `onClick` on the outer `motion.div` wrapper calls `onEdit(task)`. The `distance: 8` drag constraint already prevents drag from firing on taps, so no conflict.

`KanbanBoard` holds `editingTask` state (`null | task`); renders `<TaskEditSheet>` when non-null. `KanbanColumn` passes `onEdit` down to each `TaskCard`.

### 4.3 Delete with undo toast

In `KanbanBoard`, `pendingDeleteRef = useRef(null)` stores the active timeout id:

1. Close sheet → optimistically remove task from `tasks` state.
2. If `pendingDeleteRef.current` exists: flush previous delete immediately (call DB write synchronously), then clear.
3. Start new `setTimeout(4000)` stored in `pendingDeleteRef.current` that calls `supabase.from('tasks').update({ deleted_at: new Date().toISOString() }).eq('id', id)`.
4. Show `toast('Task excluída', { action: { label: 'Desfazer', onClick: handleUndo }, duration: 4000 })`.
5. `handleUndo`: `clearTimeout(pendingDeleteRef.current)` → restore task in `tasks` state at its original position.

### 4.4 Reorder within column

`onTasksChange` is the prop received from `TasksPage` (`<KanbanBoard onTasksChange={setTasks} />`), not a local state setter — consistent with the existing cross-column drag implementation.

Extend `handleDragEnd` in `KanbanBoard` using `arrayMove` from `@dnd-kit/sortable`:

```js
if (targetStatus === activeTask.status) {
  const col = grouped[targetStatus]
  const oldIdx = col.findIndex(t => t.id === active.id)
  const newIdx = col.findIndex(t => t.id === over.id)
  if (oldIdx === newIdx) return
  const reordered = arrayMove(col, oldIdx, newIdx)
  const updatedTasks = tasks.map(t => {
    const pos = reordered.findIndex(r => r.id === t.id)
    return pos !== -1 ? { ...t, position: pos } : t
  })
  onTasksChange(updatedTasks)
  await Promise.all(
    reordered.map((t, i) => supabase.from('tasks').update({ position: i }).eq('id', t.id))
  )
  // on error: revert prevTasks + toast.error
}
```

### 4.5 Empty state per column

In `KanbanColumn`, when `!loading && tasks.length === 0`, render above `NewTaskButton`:

```jsx
<div style={{ textAlign: 'center', padding: '20px 8px', color: '#ACA4C8', fontSize: 12 }}>
  Nada aqui ainda
</div>
```

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `src/components/tasks/NewTaskButton.jsx` | modify | Inline form, editing state, priority pills, onCreateTask prop |
| `src/components/tasks/TaskCard.jsx` | modify | onEdit prop; onClick on outer wrapper |
| `src/components/tasks/KanbanColumn.jsx` | modify | Pass onEdit + onCreateTask; empty state |
| `src/components/tasks/KanbanBoard.jsx` | modify | Within-column reorder; editingTask state; create/save/delete+undo |
| `src/components/tasks/TaskEditSheet.jsx` | create | Bottom sheet; Framer Motion slide-up; glass-surface-strong |

## 6. Acceptance

- [ ] Clicking "Nova task" reveals inline form; submitting creates task in correct column; persists after reload.
- [ ] Tapping a card opens TaskEditSheet with correct title and priority pre-filled.
- [ ] Editing title/priority and saving updates the card; persists after reload.
- [ ] Deleting shows 4-second undo toast; Desfazer restores the card; expiry causes DB soft-delete.
- [ ] Dragging within a column reorders; order persists after reload.
- [ ] Empty column shows "Nada aqui ainda".
- [ ] `npm run build` exits 0.

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| Tap vs drag conflict on TaskCard | `distance: 8` PointerSensor constraint already in place; onClick fires only on true taps |
| Batch position update on reorder is N individual writes | Acceptable for V1 (max ~20 tasks/column); revisit with a Postgres function if needed |
| Two concurrent pending deletes | Flush first delete synchronously before starting second (§4.3) |
| Undo after navigating away | `pendingDeleteRef` is in `KanbanBoard`; if user navigates to DumpPage and back, the ref is lost and delete fires naturally on unmount. Acceptable for V1. |

## 8. Rollout

Single commit: `feat(#34): Kanban CRUD — create, edit, delete with undo, reorder, empty state`
