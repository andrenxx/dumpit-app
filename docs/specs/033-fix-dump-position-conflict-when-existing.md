# Spec 033 — Fix dump position conflict when existing tasks present

| Field    | Value                                                                              |
| -------- | ---------------------------------------------------------------------------------- |
| Issue    | [#33](https://github.com/andrenxx/dumpit/issues/33)                                |
| Branch   | `fix/33-fix-dump-position-conflict-when-existing`                                  |
| Status   | Draft — awaiting review                                                            |
| Type     | bug                                                                                |
| Parent   | Decomposed from spec #031                                                          |

## 1. Context

`functions/api/parse-tasks.js` always inserts new tasks with `position: 0, 1, 2, …` regardless of how many tasks already exist in `a_fazer`. When the user already has tasks and does a second dump, the new tasks land with positions that collide with existing ones, producing unpredictable ordering in the Kanban board (`TasksPage` queries `.order('position', { ascending: true })`).

## 2. Goals

- New tasks inserted by a dump are appended after the last existing `a_fazer` task, preserving existing order.

## 2.5 Validation strategy

Open `http://localhost:5173` with Wrangler running on port 8788:

1. Do a first dump — tasks appear in `a_fazer` in parsed order.
2. Do a second dump — new tasks appear at the bottom of `a_fazer`, original tasks untouched.
3. Reload — order persists (confirms DB positions are correct).

## 3. Non-goals

- Any UI changes.
- Position normalization for tasks already in the DB with conflicting positions.
- Changes to task parsing logic or AI prompt.

## 4. Design

Before building `taskRows`, query the current maximum `position` among the user's non-deleted `a_fazer` tasks:

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

`.single()` returns `{ data: null }` when no rows match — `basePosition` defaults to `0` correctly.

## 4.5 UX decision

N/A — pure serverless bug fix, no UI change.

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `functions/api/parse-tasks.js` | modify | Query MAX position before building taskRows |

## 6. Acceptance

- [ ] First dump with no existing tasks: tasks start at position 0 (unchanged).
- [ ] Second dump with existing `a_fazer` tasks: new tasks have positions > all existing tasks.
- [ ] After second dump, `a_fazer` column shows original tasks first, new tasks at bottom, after page reload.
- [ ] `npm run build` exits 0.

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| `.single()` error when `a_fazer` is empty | Returns `{ data: null }` — `basePosition` defaults to `0`, same as current behavior |
| Race condition: two simultaneous dumps | Both query the same MAX and start from the same base — positions within each batch are unique; across batches they may overlap. Acceptable for V1 (single-user sessions). |

## 8. Rollout

Single commit: `fix(#33): append dump tasks after existing a_fazer positions`
