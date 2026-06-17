# Spec 031 — Kanban full CRUD — create, edit, delete, reorder, empty state, position fix

| Field    | Value                                                                              |
| -------- | ---------------------------------------------------------------------------------- |
| Issue    | [#31](https://github.com/andrenxx/dumpit/issues/31)                                |
| Branch   | `feat/31-kanban-full-crud-create-edit-delete-reor`                                 |
| Status   | Draft — awaiting review                                                            |
| Type     | feature                                                                            |

## 1. Context

Spec #24 delivered the Kanban visuals (columns, cards, drag between columns, skeletons, ProgressCard). The interaction layer is incomplete: `NewTaskButton` has no handler, there is no way to edit or delete a task, drag within a column does not persist position, empty columns have no empty state, and `parse-tasks.js` always inserts new tasks starting at `position: 0` — conflicting with existing tasks in `a_fazer`.

## 2. Goals

1. **Create** — `NewTaskButton` opens an inline form; submitting persists the task in the correct column.
2. **Edit** — tapping a task card opens a bottom sheet to edit title and priority; saving persists.
3. **Delete** — delete action in the edit sheet removes the task optimistically and shows a 4-second undo toast; the DB write is deferred until the toast auto-dismisses.
4. **Reorder within column** — dragging a card within the same column reorders the list and persists positions in DB.
5. **Empty state** — each column displays a friendly message when it has no tasks.
6. **Position fix** — `parse-tasks.js` queries the current MAX position in `a_fazer` before inserting, so new dump tasks are appended rather than overwriting existing ones.

## 2.5 Validation strategy

Run `npm run build` (passes). Open `http://localhost:5173` (Vite + Wrangler proxy):

1. **Create** — click "Nova task" in any column, type a title, pick a priority, submit → card appears in that column; reload confirms DB persistence.
2. **Edit** — tap a card → bottom sheet slides up with correct title/priority; edit and save → card updates instantly.
3. **Delete + undo** — open edit sheet, click Excluir → card disappears, undo toast appears for 4 s; click Desfazer → card comes back. Let a second delete expire → card stays gone after reload.
4. **Reorder** — drag card within a column to a new position → order persists after reload.
5. **Empty state** — delete all tasks in a column → empty state message appears.
6. **Position fix** — with tasks already in `a_fazer`, do a new dump → new tasks appear at the bottom, existing order unchanged.

## 3. Non-goals

- Bulk actions (mark all as done).
- Task due dates or subtasks.
- Filters or search across columns.
- Keyboard navigation / accessibility hardening.
- Touch-swipe-to-delete gesture (undo toast covers this UX need).

## 4. Design

### 4.1 Create — inline form in NewTaskButton

`NewTaskButton` holds local `editing` state. When `editing = false`, it renders the current dashed "+ Nova task" button. When `editing = true`, it renders an inline form:

```
┌──────────────────────────────────────────┐
│  [textarea — "Nome da task..."]          │
│  [Alta] [Média] [Baixa]    [Adicionar]   │
└──────────────────────────────────────────┘
```

- `textarea` is single-line (`rows={1}`), autofocuses, max 200 chars.
- Priority pills are toggle buttons; default `media`.
- Clicking outside (blur on form) or pressing Escape cancels without saving.
- On submit: call `onCreateTask({ title, priority })` prop → parent handles DB insert.
- Optimistic: parent appends the task with a temp id; DB insert replaces temp id on success.

`NewTaskButton` receives props: `columnStatus`, `onCreateTask`.
`KanbanColumn` receives `onCreateTask` from `KanbanBoard`.
`KanbanBoard` handles the supabase insert and `onTasksChange` update.

Position for new task: `grouped[columnStatus].length` (appended to end of column).

### 4.2 Edit — TaskEditSheet bottom sheet

New `src/components/tasks/TaskEditSheet.jsx`:

```
┌─────────────────────────────────────┐  ← backdrop (rgba 0,0,0,0.3 + blur 6px)
│                                     │
│  ┌───────────────────────────────┐  │
│  │  [textarea — task title]      │  │  ← glass-surface-strong rounded-t-[24px]
│  │                               │  │
│  │  [Alta] [Média] [Baixa]       │  │
│  │                               │  │
│  │  [Salvar]        [Excluir]    │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

- Slides in from bottom: `y: '100%' → y: 0` (Framer Motion).
- Backdrop click closes without saving.
- `Salvar`: calls `onSave({ id, title, priority })` → optimistic update + `supabase.update()`.
- `Excluir`: calls `onDelete(id)` — see §4.3.

`TaskCard` receives `onEdit` prop → `onClick` on the card outer wrapper calls `onEdit(task)`.
`KanbanBoard` holds `editingTask` state (`null | task`); renders `<TaskEditSheet>` when non-null.
`KanbanColumn` passes `onEdit` down to each `TaskCard`.

### 4.3 Delete with undo toast

Flow when user clicks Excluir in `TaskEditSheet`:

1. Close the sheet.
2. Optimistically remove task from `tasks` state.
3. Start a `setTimeout` (4000 ms) stored in `pendingDeleteRef` in `KanbanBoard`.
4. Show: `toast('Task excluída', { action: { label: 'Desfazer', onClick: handleUndo }, duration: 4000 })`.
5. `handleUndo`: `clearTimeout(pendingDeleteRef.current)` → restore task in state.
6. On timeout: `supabase.from('tasks').update({ deleted_at: new Date().toISOString() }).eq('id', id)`.

If a second delete arrives before the first undo window expires, flush the first delete immediately (call the DB write synchronously), then start the new pending delete.

### 4.4 Reorder within column

Extend `handleDragEnd` in `KanbanBoard` with the within-column case using `arrayMove` from `@dnd-kit/sortable`:

```js
if (targetStatus === activeTask.status) {
  const col = grouped[targetStatus]
  const oldIdx = col.findIndex(t => t.id === active.id)
  const newIdx = col.findIndex(t => t.id === over.id)
  if (oldIdx === newIdx) return
  const reordered = arrayMove(col, oldIdx, newIdx)
  // optimistic
  const updatedTasks = tasks.map(t => {
    const pos = reordered.findIndex(r => r.id === t.id)
    return pos !== -1 ? { ...t, position: pos } : t
  })
  onTasksChange(updatedTasks)
  // persist
  await Promise.all(
    reordered.map((t, i) => supabase.from('tasks').update({ position: i }).eq('id', t.id))
  )
  // on error: revert + toast
}
```

### 4.5 Empty state per column

In `KanbanColumn`, when `!loading && tasks.length === 0`, render above `NewTaskButton`:

```jsx
<div style={{ textAlign: 'center', padding: '20px 8px', color: '#ACA4C8', fontSize: 12 }}>
  Nada aqui ainda
</div>
```

### 4.6 Position fix in parse-tasks.js

Before building `taskRows`, query current max position for user's `a_fazer` tasks:

```js
const { data: maxRow } = await supabase
  .from('tasks')
  .select('position')
  .eq('user_id', userId)
  .eq('status', 'a_fazer')
  .is('deleted_at', null)
  .order('position', { ascending: false })
  .limit(1)
  .single()

const basePosition = maxRow ? maxRow.position + 1 : 0

const taskRows = parsedTasks.map((t, i) => ({
  user_id: userId,
  title: String(t.title || '').slice(0, 200),
  priority: ['alta', 'media', 'baixa'].includes(t.priority) ? t.priority : 'media',
  status: 'a_fazer',
  position: basePosition + i,
}))
```

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `src/components/tasks/NewTaskButton.jsx` | modify | Inline form with editing state, title textarea, priority pills, onCreateTask prop |
| `src/components/tasks/TaskCard.jsx` | modify | Add onEdit prop; onClick outer wrapper opens edit sheet |
| `src/components/tasks/KanbanColumn.jsx` | modify | Pass onEdit + onCreateTask; add empty state when tasks.length === 0 |
| `src/components/tasks/KanbanBoard.jsx` | modify | Within-column reorder; editingTask state; create/save/delete with undo |
| `src/components/tasks/TaskEditSheet.jsx` | create | Bottom sheet for edit + delete; Framer Motion slide-up; glass-surface-strong |
| `functions/api/parse-tasks.js` | modify | Query MAX position before insert to fix position conflict |

## 6. Acceptance

- [ ] Clicking "Nova task" reveals inline form; submitting creates task in correct column; DB persists.
- [ ] Tapping a card opens TaskEditSheet with correct title and priority pre-filled.
- [ ] Editing title/priority and saving updates the card and persists after reload.
- [ ] Deleting shows 4-second undo toast; Desfazer restores; expiry causes DB soft-delete.
- [ ] Dragging within a column reorders; order persists after page reload.
- [ ] Empty column shows "Nada aqui ainda".
- [ ] Dumping with existing a_fazer tasks appends new tasks at the end; existing order unchanged.
- [ ] `npm run build` exits 0.

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| Tap vs drag conflict on TaskCard | `distance: 8` PointerSensor constraint already in place; onClick fires only on true taps |
| Batch position update on reorder is N individual writes | Acceptable for V1 (max ~20 tasks/column); revisit with a Postgres function if needed |
| Two concurrent pending deletes | Flush first delete synchronously before starting second (§4.3) |
| `maxRow.single()` returns error when a_fazer is empty | `data` is `null` → `basePosition` defaults to `0` correctly |

## 8. Rollout

Two commits:

1. `fix(#31): fix position conflict in parse-tasks when existing tasks present`
2. `feat(#31): Kanban CRUD — create, edit, delete with undo, reorder, empty state`
