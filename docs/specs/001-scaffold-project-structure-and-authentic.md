# Spec 001 — Scaffold, Project Structure and Authentication

| Field  | Value                                                                             |
| ------ | --------------------------------------------------------------------------------- |
| Issue  | [#1](https://github.com/andrenxx/dumpit/issues/1)                                 |
| Branch | `feat/1-scaffold-project-structure-and-authentic`                                 |
| Status | Draft — awaiting review                                                           |
| Type   | feature                                                                           |

## 1. Context

The repository has scaffolding (workflow tooling, migrations, env vars) but
zero application code. Every subsequent session depends on a working frontend
runtime, a Supabase client, and an auth layer. This spec delivers the minimum
foundation: a Vite + React app wired to Supabase with magic-link auth and
protected routing. No product features ship here — only the platform every
feature rides on.

See [ADR 0001](../architecture/decisions/0001-spec-driven-workflow.md) for
workflow context.

## 2. Goals

- `npm run dev` starts a Vite dev server with no console errors.
- Supabase client is initialized from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Unauthenticated users visiting `/dashboard` are redirected to `/`.
- Authenticated users can reach `/dashboard`.
- Magic-link email is sent via Supabase Auth and clicking it completes login.
- A row in `public.users` is created automatically on first login (existing trigger).
- Session persists across page reloads for 30 days.
- `signOut()` clears the session and redirects to `/`.

## 2.5 Validation strategy

Manual end-to-end flow on `localhost:5173`:
1. Navigate to `/` — Landing stub renders.
2. Navigate to `/dashboard` without a session — redirected to `/`.
3. Enter a real email in LoginModal — magic link email arrives within 10s.
4. Click the link — browser redirects to `/dashboard`, user is authenticated.
5. Reload the page — session persists, still on `/dashboard`.
6. Click logout — session cleared, redirected to `/`.
7. Confirm in Supabase Dashboard → Table Editor → `public.users` that a row
   was inserted for the test email.

## 3. Non-goals

- Any UI beyond text stubs ("Landing" / "Dashboard" on screen).
- Tailwind component design — Tailwind is configured but unstyled.
- Kanban, AI, push notifications, payments.
- Error state design for auth failures (placeholder `console.error` is fine).
- Email template customization in Supabase.

## 4. Design

### 4.1 Project initialization

```bash
npm create vite@latest . -- --template react
npm install react-router-dom @supabase/supabase-js
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

`@dnd-kit/core` and `@dnd-kit/sortable` are installed now to avoid a
reinstall mid-session 2, but not used yet.

### 4.2 Folder structure

Matches CLAUDE.md exactly:

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginModal.jsx
│   │   └── AuthGuard.jsx
│   ├── kanban/          # empty, reserved
│   ├── chat/            # empty, reserved
│   ├── paywall/         # empty, reserved
│   └── ui/              # empty, reserved
├── pages/
│   ├── Landing.jsx
│   └── Dashboard.jsx
├── hooks/
│   └── useAuth.js
├── lib/
│   └── supabase.js
├── App.jsx
└── main.jsx
```

### 4.3 Supabase client (`src/lib/supabase.js`)

```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### 4.4 `useAuth` hook (`src/hooks/useAuth.js`)

Exposes:
- `user` — current Supabase user object or `null`.
- `loading` — `true` while the initial session is being resolved.
- `signInWithEmail(email)` — calls `supabase.auth.signInWithOtp({ email })`.
- `signOut()` — calls `supabase.auth.signOut()`.

Subscribes to `supabase.auth.onAuthStateChange` on mount; unsubscribes on
unmount. Sets `loading = false` once the first `INITIAL_SESSION` event fires.

### 4.5 `LoginModal` (`src/components/auth/LoginModal.jsx`)

Controlled by a `isOpen` prop. Contains:
- Email input with format validation.
- "Entrar" submit button — calls `signInWithEmail`, then shows a
  "Verifique seu email" confirmation message.
- Close button (calls `onClose` prop).

No password field — magic-link only.

### 4.6 `AuthGuard` (`src/components/auth/AuthGuard.jsx`)

Wraps protected routes. While `loading` is `true`, renders nothing (avoids
flash of redirect). Once resolved: if `user` is null, `<Navigate to="/" />`; otherwise renders `children`.

### 4.7 Routing (`src/App.jsx`)

```
/            → <Landing />       (public)
/dashboard   → <AuthGuard><Dashboard /></AuthGuard>
```

Uses `createBrowserRouter` + `RouterProvider` (React Router 6).

### 4.8 Page stubs

`Landing.jsx` — renders the LoginModal when `showLogin` state is true; has
a "Entrar" button to open it. Body text: "DumpIt — dump it, nós organizamos."

`Dashboard.jsx` — renders "Dashboard" heading and a logout button that calls
`signOut()`.

### 4.9 Tailwind config

`tailwind.config.js` content glob covers `./src/**/*.{js,jsx}`.
`index.css` includes the three Tailwind directives. No design tokens yet.

## 4.5 UX decision

N/A — no UX surface introduced beyond placeholder stubs.

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `package.json` | create | Vite + React + deps |
| `vite.config.js` | create | default Vite React config |
| `tailwind.config.js` | create | content glob for src/ |
| `postcss.config.js` | create | tailwind + autoprefixer |
| `index.html` | create | Vite entry point |
| `src/main.jsx` | create | entry, StrictMode, RouterProvider |
| `src/App.jsx` | create | route definitions |
| `src/index.css` | create | Tailwind directives |
| `src/lib/supabase.js` | create | Supabase client |
| `src/hooks/useAuth.js` | create | auth state + signIn + signOut |
| `src/components/auth/LoginModal.jsx` | create | magic-link email form |
| `src/components/auth/AuthGuard.jsx` | create | session-gated wrapper |
| `src/pages/Landing.jsx` | create | public stub + login trigger |
| `src/pages/Dashboard.jsx` | create | protected stub + logout |

## 6. Acceptance

- [ ] `npm run dev` starts without errors or warnings in the terminal.
- [ ] Navigating to `/` renders "DumpIt — dump it, nós organizamos."
- [ ] Navigating to `/dashboard` without a session redirects to `/`.
- [ ] Clicking "Entrar" on Landing opens LoginModal.
- [ ] Submitting a valid email shows "Verifique seu email" confirmation.
- [ ] Clicking the magic link in the email redirects to `/dashboard`.
- [ ] Reloading `/dashboard` after login keeps the user authenticated.
- [ ] Clicking logout redirects to `/` with session cleared.
- [ ] `public.users` row exists in Supabase for the test email after first login.

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| Magic link redirect URL mismatch | Set Site URL to `http://localhost:5173` in Supabase Auth settings before testing |
| Supabase `INITIAL_SESSION` fires before component mounts | `loading` guard in AuthGuard prevents redirect flash |

## 8. Rollout

Single PR. Two logical commits:
1. `chore(#1): initialize vite project and folder structure` — package.json, config files, empty dirs.
2. `feat(#1): add supabase auth with magic-link and protected routing` — lib, hooks, components, pages.

No follow-up issues needed. Session 2 picks up from this foundation.

---

**Reviewer checklist:**

- Goals are achievable inside this PR.
- Non-goals are explicit; nothing snuck in.
- File list is complete.
- Acceptance criteria are objective.
