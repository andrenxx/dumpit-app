# Spec FIXTURE-S — Add download-count metric to upload row

| Field    | Value                                  |
| -------- | -------------------------------------- |
| Issue    | (fixture)                              |
| Branch   | `chore/fixture-single`                 |
| Status   | Draft — awaiting review                |
| Type     | feature                                |

## 1. Context

Dashboard upload rows do not show how many times the final audio was
downloaded. Operators have asked for this signal to triage which jobs
were ever actually used.

## 2. Goals

- Each upload row shows a download counter.
- The counter persists across page reloads.
- The counter increments on every successful download API hit.

## 2.5 Validation strategy

E2E test loads the dashboard, triggers two downloads of one job, reloads,
asserts the counter reads `2` on the corresponding row.

## 3. Non-goals

- Per-user download attribution.
- Historical backfill for jobs older than one week.

## 4. Design

### 4.1 Storage

Add `download_count` (int, default 0) to the upload row schema.

### 4.2 Increment

The download route reads the row, increments, writes back atomically.

### 4.3 Render

Dashboard upload row component reads the field and renders next to the title.

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `src/lib/supabase.ts` | modify | Add field to row type. |
| `src/app/api/audio/[id]/download/route.ts` | modify | Increment on success. |
| `src/components/dashboard/UploadRow.tsx` | modify | Render the counter. |
| `tests/e2e/download-counter.spec.ts` | add | E2E coverage. |

## 6. Acceptance

- [ ] Counter starts at 0 for new uploads.
- [ ] Counter increments on every download.
- [ ] E2E test passes.

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| Race on concurrent downloads. | JSON write is single-process in PoC. |

## 8. Rollout

Single PR, three commits: storage, route, render + test.
