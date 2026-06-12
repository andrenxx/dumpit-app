# Spec FIXTURE-R — Replace local-disk persistence with full Supabase backend

| Field    | Value                                  |
| -------- | -------------------------------------- |
| Issue    | (fixture)                              |
| Branch   | `chore/fixture-rescope`                |
| Status   | Draft — awaiting review                |
| Type     | chore                                  |

## 1. Context

The PoC stores upload metadata in `tmp/db/audio_uploads.json` and
binaries on local disk. Production needs Supabase: Postgres for rows,
Storage for binaries, Auth for the dashboard, Realtime for job status,
and an Edge Function to keep the worker single-process discipline
without the local poller.

## 2. Goals

- Postgres schema replaces JSON tables with full referential
  integrity, migrations, and RLS.
- Supabase Storage replaces local FS for both source uploads and
  rendered output, with signed-URL download flow.
- Supabase Auth gates the dashboard with magic-link login and a
  `viewer` / `operator` role split.
- Supabase Realtime drives the dashboard's job-status updates,
  replacing polling.
- Supabase Edge Function hosts the worker loop, replacing the local
  `tsx` process.
- All existing E2E tests pass against a Supabase test project.

## 2.5 Validation strategy

Spin up a throwaway Supabase project; run the existing E2E suite plus
a new auth-flow test; confirm zero references to `tmp/db/` and
`tmp/storage/` remain in `src/`.

## 3. Non-goals

- Production data migration from any deployed PoC instance (none
  exists yet).

## 4. Design

### 4.1 Schema

Translate the JSON shape to relational tables: `audio_uploads`,
`tts_runs`, `download_events`. Each gets its own migration. RLS
policies match the role split.

### 4.2 Storage

Two buckets: `sources` (private, signed-URL upload) and `renders`
(private, signed-URL download).

### 4.3 Auth

Magic-link via Supabase Auth UI; `auth.users` joined to a `profiles`
table for role.

### 4.4 Realtime

Subscribe the dashboard to row-level changes on `audio_uploads`,
streaming status into the existing components.

### 4.5 Edge Function worker

Move `src/worker/` logic into a Supabase Edge Function with the same
single-job discipline; trigger on `audio_uploads` insert.

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `supabase/migrations/0001_audio_uploads.sql` | add | Initial schema. |
| `supabase/migrations/0002_storage_buckets.sql` | add | Bucket policies. |
| `supabase/migrations/0003_auth_profiles.sql` | add | Profile + role. |
| `src/lib/supabase.ts` | rewrite | Full Supabase client; replaces JSON shim. |
| `src/lib/queue.ts` | delete | Polling no longer needed. |
| `src/worker/index.ts` | delete | Replaced by Edge Function. |
| `supabase/functions/process-upload/index.ts` | add | Edge Function port. |
| `src/app/api/audio/[id]/download/route.ts` | rewrite | Signed-URL flow. |
| `src/app/dashboard/page.tsx` | rewrite | Auth gate + Realtime subscription. |
| `src/app/login/page.tsx` | add | Magic-link page. |

## 6. Acceptance

- [ ] All migrations apply cleanly to a fresh Supabase project.
- [ ] No `tmp/db/` or `tmp/storage/` references remain in `src/`.
- [ ] E2E suite + new auth test passes.

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| Edge Function cold start affects worker latency. | Acceptable for PoC-to-prod transition; measure. |

## 8. Rollout

Single PR, ten commits, one per migration / module.
