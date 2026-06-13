# Spec 005 — AI parse-tasks Endpoint: Parse Natural Language Dump and Persist Tasks

| Field  | Value                                                                              |
| ------ | ---------------------------------------------------------------------------------- |
| Issue  | [#5](https://github.com/andrenxx/dumpit/issues/5)                                  |
| Branch | `feat/5-ai-parse-tasks-endpoint-parse-natural-la`                                  |
| Status | Draft — awaiting review                                                            |
| Type   | feature                                                                            |

## 1. Context

DumpIt's core loop is: user dumps tasks in natural language → AI organizes them
into a Kanban. This spec delivers the server-side half of that loop. The frontend
sends raw text; this endpoint validates the caller, enforces the freemium gate,
calls Claude to parse the dump, persists the resulting tasks to Supabase, and
returns the inserted rows.

The schema is already in place (`public.tasks`, `public.ai_usage`,
`public.ai_conversations`, `public.users` with `plan` field). This spec only adds
the application code.

Freemium model (decided during spec): free plan = 1 AI call lifetime (trial to
show value); paid plan = unlimited AI calls. Manual Kanban remains free forever.

## 2. Goals

- `POST /api/parse-tasks` validates the Supabase JWT and rejects unauthenticated
  requests with 401.
- Free-plan users who have already used their 1 lifetime AI call receive 402 with
  JSON body `{ "error": "upgrade_required" }`.
- The endpoint calls `claude-sonnet-4-6` with the raw text and returns structured
  tasks (title, priority, status).
- Parsed tasks are inserted into `public.tasks` for the authenticated user.
- The raw input + parsed result is logged in `public.ai_conversations`.
- The user's lifetime AI usage is recorded so the gate works on the next call.
- CORS headers are returned on every response (including `OPTIONS` preflight).

## 2.5 Validation strategy

Manual end-to-end via `curl` or REST client against the local Wrangler dev server:

1. Call `POST /api/parse-tasks` without a token → expect 401.
2. Call with a valid JWT from a free-plan user + PT-BR text dump → expect 200,
   tasks returned, rows visible in Supabase `public.tasks`.
3. Call again with the same free-plan JWT → expect 402 `upgrade_required`.
4. Inspect `public.ai_usage` and `public.ai_conversations` rows to confirm correct writes.
5. Call with missing `text` field → expect 400 `text_required`.
6. Send `OPTIONS` preflight → expect 204 with CORS headers.

## 3. Non-goals

- Frontend UI (ChatInput, task list, Kanban columns) — separate spec.
- `functions/checkin-summary.js` daily summary endpoint — separate spec.
- Web push notifications — separate spec.
- Stripe / payment processing — deferred.
- Editing or deleting tasks via this endpoint — out of scope.
- Listing or paginating tasks — out of scope.

## 4. Design

### 4.1 Route

Cloudflare Pages Functions route: `functions/api/parse-tasks.js`.
Maps to `POST /api/parse-tasks` automatically via the filesystem convention.

### 4.2 Request shape

```
POST /api/parse-tasks
Authorization: Bearer <supabase-access-token>
Content-Type: application/json

{ "text": "<natural language task dump in PT-BR>" }
```

`text` is required; empty string or missing field → 400.

### 4.3 Handler flow

```
onRequestPost(context):
  1. CORS preflight guard — OPTIONS → 204 with headers, return early
  2. Extract JWT from Authorization header
     → missing / malformed: 401
  3. Verify JWT via supabase.auth.getUser(token) with service role client
     → invalid token: 401
  4. Extract user_id from returned user object
  5. Fetch user plan: SELECT plan FROM public.users WHERE id = user_id
  6. If plan = 'free':
       count rows in ai_usage WHERE user_id = ?
       if count >= 1 → 402 { error: "upgrade_required" }
  7. Parse request body → extract text
     → missing or empty: 400 { error: "text_required" }
  8. Call Claude API (claude-sonnet-4-6) with structured prompt (§4.4)
     → API error or non-200: 502 { error: "ai_unavailable" }
  9. JSON.parse Claude response → array of task objects
     → parse failure: 502 { error: "ai_unavailable" }
  10. INSERT tasks into public.tasks (batch), setting position = array index
  11. INSERT into public.ai_conversations (raw_input, parsed_tasks as jsonb)
  12. INSERT into public.ai_usage (user_id, date = today, calls_count = 1)
      ON CONFLICT (user_id, date) DO UPDATE SET calls_count = calls_count + 1
  13. Return 200 { tasks: [inserted rows] }
```

### 4.4 Claude prompt

**System:**
```
You are a task parser for a Brazilian productivity app called DumpIt.
The user will send a natural language dump of things they need to do,
in Brazilian Portuguese. Extract each distinct task and return a JSON array.

Each task object must have:
- "title": string (max 200 chars, PT-BR, imperative form)
- "priority": "alta" | "media" | "baixa"
- "status": always "a_fazer"

Return ONLY valid JSON — no markdown, no explanation, no code blocks.
Example: [{"title":"Ligar para o cliente","priority":"alta","status":"a_fazer"}]
```

**User message:** the raw `text` field from the request body.

### 4.5 Supabase access

Single admin client initialized with `context.env.SUPABASE_URL` and
`context.env.SUPABASE_SERVICE_ROLE_KEY` (service role bypasses RLS for all
writes; security is enforced by JWT validation at the handler level).

JWT verification: `supabase.auth.getUser(token)` — validates signature and
expiry, returns the user object.

### 4.6 CORS

Allowed origins: `https://dumpit.com.br`, `https://www.dumpit.com.br`,
`http://localhost:5173`.

Every response includes:
```
Access-Control-Allow-Origin: <matched origin>
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
```

### 4.7 Environment variables

Accessed via `context.env.*` (Workers runtime — no `process.env`):

| Variable | Description |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only) |
| `CLAUDE_API_KEY` | Anthropic API key (server-only) |

Set in `.dev.vars` for local Wrangler dev; Cloudflare Dashboard for production.

## 4.5 UX decision

N/A — no user-facing UI in this spec.

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `functions/api/parse-tasks.js` | create | Cloudflare Pages Function — full handler |

One file. Schema migrations already deployed.

## 6. Acceptance

- [ ] `POST /api/parse-tasks` without `Authorization` returns 401.
- [ ] Valid JWT + PT-BR text returns 200 with `{ tasks: [...] }`.
- [ ] Each task has `id`, `user_id`, `title`, `priority`, `status`, `created_at`.
- [ ] Rows appear in `public.tasks` in Supabase after a successful call.
- [ ] Row appears in `public.ai_conversations` with `raw_input` and `parsed_tasks`.
- [ ] Row appears in `public.ai_usage` for the user.
- [ ] Second call from the same free-plan user returns 402 `upgrade_required`.
- [ ] Empty `text` field returns 400 `text_required`.
- [ ] `OPTIONS` preflight returns 204 with correct CORS headers.

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| Claude returns malformed JSON | Catch `JSON.parse` error → 502; the prompt instructs raw JSON only |
| `@supabase/supabase-js` bundle incompatibility with Workers | ESM build is Workers-compatible; if issues arise use Supabase REST API directly via `fetch` |
| `SUPABASE_URL` vs `VITE_SUPABASE_URL` confusion | Server function reads `context.env.SUPABASE_URL` only; documented in `.dev.vars.example` |
| Task position conflicts on bulk insert | Set `position` to array index at insert time |

## 8. Rollout

Single PR, single commit:
`feat(#5): add parse-tasks cloudflare function with ai and rate limiting`

Test via `curl` against local Wrangler dev server (`wrangler pages dev dist --compatibility-date=2024-01-01`).
No migrations required — schema already deployed.

---

**Reviewer checklist:**

- Goals are achievable inside this PR.
- Non-goals are explicit; nothing snuck in.
- File list is complete.
- Acceptance criteria are objective.
