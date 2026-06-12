# Spec FIXTURE-D — Aurora dashboard refresh and worker telemetry

| Field    | Value                                       |
| -------- | ------------------------------------------- |
| Issue    | (fixture)                                   |
| Branch   | `feat/fixture-decompose`                    |
| Status   | Draft — awaiting review                     |
| Type     | feature                                     |

## 1. Context

Two unrelated asks landed in the same week: marketing wants the
dashboard restyled with the Aurora token set, and ops wants per-job
telemetry (duration, retry count, last-error) emitted by the worker.
Both are real, both are independently valuable.

## 2. Goals

- Dashboard renders with Aurora tokens (no hex literals, no raw
  Tailwind colors) on every page.
- Worker emits per-job telemetry to a new `tmp/db/telemetry.json`
  file on every run.
- Operators can read the telemetry file with `jq` to triage.

## 2.5 Validation strategy

Dashboard restyle: visual regression baseline on Chromium for the
two main pages, plus a Playwright assertion that no element has a
`#`-prefixed inline style. Worker telemetry: a Node test triggers
one job and asserts `tmp/db/telemetry.json` gains one row with the
expected schema.

## 3. Non-goals

- Telemetry dashboard UI (file is enough for this spec).
- Aurora token migration of the worker logs (not user-facing).

## 4. Design

### 4.1 Dashboard restyle

Replace hex literals and raw Tailwind colors across
`src/components/dashboard/**/*.tsx` and `src/app/dashboard/page.tsx`
with Aurora tokens defined in `src/app/globals.css`.

### 4.2 Worker telemetry

Add a `recordTelemetry()` function in `src/worker/telemetry.ts`
called at the end of `src/worker/index.ts`'s job loop. Writes one
JSON line per job to `tmp/db/telemetry.json`.

### 4.3 Operator triage path

Document in `docs/operations/telemetry.md` how to read the file
with `jq` and what each field means.

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `src/components/dashboard/UploadRow.tsx` | modify | Aurora tokens. |
| `src/components/dashboard/UploadList.tsx` | modify | Aurora tokens. |
| `src/app/dashboard/page.tsx` | modify | Aurora tokens. |
| `tests/e2e/dashboard-aurora.spec.ts` | add | Visual + a11y baseline. |
| `src/worker/telemetry.ts` | add | New module. |
| `src/worker/index.ts` | modify | Call `recordTelemetry()`. |
| `tests/worker/telemetry.test.ts` | add | Unit + integration. |
| `docs/operations/telemetry.md` | add | Triage docs. |

## 6. Acceptance

- [ ] Dashboard visual baseline passes.
- [ ] No hex literals in `src/components/dashboard/`.
- [ ] Worker writes one row per job to `tmp/db/telemetry.json`.
- [ ] `docs/operations/telemetry.md` exists with field descriptions.

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| Telemetry file grows unbounded. | Out of scope; follow-up issue for rotation. |

## 8. Rollout

Single PR, two commits: dashboard restyle, worker telemetry.
