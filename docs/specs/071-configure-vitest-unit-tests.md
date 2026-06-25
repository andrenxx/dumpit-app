# Spec 071 — Configure Vitest and add unit tests for core utilities

| Field  | Value                                                              |
| ------ | ------------------------------------------------------------------ |
| Issue  | [#47](https://github.com/andrenxx/dumpit/issues/47)               |
| Branch | `chore/47-configure-vitest-unit-tests`                             |
| Status | Draft — awaiting review                                            |
| Type   | chore                                                              |

## 1. Context

`vitest` and `jsdom` are already in `devDependencies` and the `test` script runs `vitest run`. However, `vite.config.js` has `passWithNoTests: true`, which makes `npm test` exit 0 even with zero test files. The test sanity gate required by the spec-driven workflow (CONTRIBUTING.md) is therefore a no-op — any spec that introduces a regression passes the gate unchecked.

The fix has two parts: activate the gate (remove `passWithNoTests`), and add at least one meaningful unit test so the gate has something to verify. The natural candidate is `groupByStatus` in `KanbanBoard.jsx` — a pure function that is currently unexported and therefore untestable. Extracting it to a utility module and adding tests demonstrates both that the harness works and that future authors have a pattern to follow.

## 2. Goals

- `npm test` exits 0 only when all tests pass; a failing test causes `npm test` to exit non-zero.
- At least one unit test file exists covering `groupByStatus` with meaningful assertions.
- The extraction of `groupByStatus` does not change the behavior of `KanbanBoard.jsx`.

## 2.5 Validation strategy

Self-validating: `npm test` is the oracle.

- After the change, `npm test` exits 0 (all tests pass).
- Introducing a deliberate assertion failure in the test file causes `npm test` to exit non-zero — confirming the gate is real.
- `npm run lint` continues to exit 0 (extraction does not introduce lint errors).

No external fixtures, no mocks, no UI flows required.

## 3. Non-goals

- Testing React components or hooks (requires more setup; separate spec if needed).
- E2E or integration tests (Playwright or similar) — a follow-on chore.
- Testing the Cloudflare Worker function (`parse-tasks.js`) — it has no pure extractable logic at this stage that isn't coupled to `context.env` or Supabase.
- Achieving a coverage threshold — the goal is one real test, not a coverage number.
- Migrating from `vitest run` to `vitest watch` for CI — not in scope.

## 4. Design

### 4.1 Remove `passWithNoTests` from vite.config.js

Delete the `passWithNoTests: true` line from the `test` block. With no test files, `vitest run` will now exit non-zero, making the gate fail-safe. After step 4.2 adds at least one test, the gate will pass again.

### 4.2 Extract `groupByStatus` to a utility module

Move the function from the top of `KanbanBoard.jsx` to `src/utils/groupByStatus.js` as a named export:

```js
const COLUMNS = ['a_fazer', 'fazendo', 'feito']

export function groupByStatus(tasks) {
  return COLUMNS.reduce((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status)
    return acc
  }, {})
}
```

Update `KanbanBoard.jsx` to import `groupByStatus` from the new module and remove the local definition. `COLUMNS` stays in `KanbanBoard.jsx` where it is also used for column ordering; `groupByStatus.js` defines its own local `COLUMNS` constant.

### 4.3 Add unit tests for `groupByStatus`

Create `src/utils/groupByStatus.test.js` with Vitest assertions covering:

1. **Empty array** — returns an object with all three column keys, each mapping to an empty array.
2. **Single task** — a task with `status: 'a_fazer'` appears in `a_fazer` and not in other columns.
3. **Mixed tasks** — tasks distributed across all three statuses appear in the correct columns.
4. **Unknown status** — a task with an unrecognized status does not appear in any column (confirm it is not leaked into any bucket).

## 4.5 UX decision

N/A — discovery marked ux: not-applicable.

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `vite.config.js` | Modify | Remove `passWithNoTests: true` |
| `src/utils/groupByStatus.js` | Create | Pure utility: `COLUMNS` constant + exported `groupByStatus` function |
| `src/utils/groupByStatus.test.js` | Create | 4 Vitest test cases |
| `src/components/tasks/KanbanBoard.jsx` | Modify | Import `groupByStatus` from utility; remove local definition |

## 6. Acceptance

- [ ] `npm test` exits 0 with all tests passing.
- [ ] `npm test` exits non-zero if any assertion in the test file fails.
- [ ] `src/utils/groupByStatus.js` exports `groupByStatus` as a named export.
- [ ] `KanbanBoard.jsx` no longer defines `groupByStatus` locally; it imports from `src/utils/groupByStatus.js`.
- [ ] Test file covers at least: empty input, single task, mixed statuses, unknown status.
- [ ] `npm run lint` exits 0 (no new lint errors from the extraction).

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| Extracting `groupByStatus` breaks KanbanBoard if the import path is wrong | Acceptance criterion requires lint to pass and existing dev server to start; the extraction is a 3-line change with no logic delta |
| `COLUMNS` duplication (defined locally in both `groupByStatus.js` and `KanbanBoard.jsx`) | Accepted — `KanbanBoard.jsx` uses `COLUMNS` for column ordering in JSX; keeping them in sync is a minor inconvenience, not a correctness risk. Deduplication is out of scope (see §3) |
| Test file for a pure function gives false confidence about the full app | Acknowledged — the goal is to activate the gate and establish the pattern, not to achieve comprehensive coverage |

## 8. Rollout

Single PR, two commits:
1. `chore(#47): remove passWithNoTests and extract groupByStatus to utility module`
2. `chore(#47): add unit tests for groupByStatus`

---

**Reviewer checklist:**

- Goals are achievable inside this PR.
- Non-goals are explicit; nothing snuck in.
- File list is complete.
- Acceptance criteria are objective.
