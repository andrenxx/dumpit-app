# Spec 069 — Onboarding flow: WelcomePage, anonymous DumpPage, login overlay on 401

| Field  | Value |
|--------|-------|
| Issue  | [#69](https://github.com/andrenxx/dumpit/issues/69) |
| Branch | `feat/69-first-time-users-hit-auth-gate-before-ex` |
| Status | Draft — awaiting review |
| Type   | feature |

## 1. Context

Today, every unauthenticated visitor to `/` is met with `Landing.jsx`, which immediately renders `LoginModal`. There is no product demo, no context, no reason to sign up. The `AuthGuard` at `/dashboard` hard-redirects any non-authenticated access back to `/`. The net result: conversion is zero and the product cannot be validated with real users.

The product's core promise is "dump it, we organize it" — but currently a user must commit to an account before they can dump a single thing. This contradicts the vision principle of "zero configuration on the first interaction."

This spec replaces the auth-first entry with a try-first onboarding flow: WelcomePage → anonymous DumpPage → login overlay triggered by the first dump attempt → TasksPage with tasks already parsed. The backend (`parse-tasks.js`) is not changed.

## 2. Goals

1. A first-time user sees WelcomePage on `/` — not a login modal.
2. Clicking "Por aqui →" shows DumpPage in anonymous mode, no account required.
3. DumpPage shows `EXAMPLE_TEXT` as a functional placeholder (~45% opacity); clears on first focus; restores on blur if user typed nothing; submits example text if user never edits.
4. Clicking "Dump" without an account triggers a `LoginModal` overlay in-place (no redirect).
5. After login, the pending text is resubmitted automatically — user arrives at TasksPage with tasks visible, no retyping.
6. Returning users (logged out, `hasSeenWelcome = true`) land directly on anonymous DumpPage — no WelcomePage repeat.
7. Logged-in users navigating to `/` are redirected to `/dashboard` immediately.
8. `ExampleCard.jsx` is removed; mascot (`pose="dump"`) appears in the DumpInput footer instead.

## 2.5 Validation strategy

Manual E2E browser test covering four flows:

1. **First-time anonymous**: clear localStorage → open `/` → WelcomePage visible → click "Por aqui →" → DumpPage visible (no account modal) → textarea shows example text at ~45% opacity → click Dump without editing → LoginModal overlay appears → login → TasksPage with tasks parsed from example text.

2. **First-time with edit**: same as above but type custom text before clicking Dump → after login → TasksPage with custom text tasks.

3. **Returning anonymous** (`hasSeenWelcome=true`, no session): open `/` → DumpPage directly (no WelcomePage) → same Dump→overlay→login→TasksPage flow.

4. **Logged-in user**: active session → open `/` → immediate redirect to `/dashboard`.

No automated tests added in this spec — all flows are UI-driven and require Supabase auth.

## 3. Non-goals

- Anonymous session persistence to the database (Option B from discovery).
- Email capture on WelcomePage before first dump (Option C from discovery).
- Changes to `KanbanBoard.jsx` or any Kanban component.
- Changes to `functions/api/parse-tasks.js` — it already returns 401 without a JWT.
- Analytics / conversion tracking.
- Cross-device sync of `hasSeenWelcome` (localStorage only, by design).
- `anonymousSession.js` utility (deferred — anonymous ID is not sent to the backend in V1).

## 4. Design

### 4.1 Route restructure

`Landing.jsx` at `/` becomes `OnboardingShell` — the pre-auth router. No new route is added to `App.jsx`; the existing `{ path: '/', element: <Landing /> }` entry stays but `Landing.jsx` gains the routing logic.

Decision tree inside `OnboardingShell` (evaluated on every render):

```
if (loading) → null (no flash)
if (user)    → <Navigate to="/dashboard" replace />
if (!hasSeenWelcome) → <WelcomePage onContinue={handleContinue} />
else         → <DumpPage (anonymous mode) />
```

`hasSeenWelcome` is `useState(() => localStorage.getItem('dumpit_seen_welcome') === 'true')`.

`handleContinue`:
```js
function handleContinue() {
  localStorage.setItem('dumpit_seen_welcome', 'true')
  setHasSeenWelcome(true)
}
```

The existing `<AuthGuard>` at `/dashboard` is untouched.

### 4.2 WelcomePage

New component at `src/pages/WelcomePage.jsx`. Renders inside `OnboardingShell`'s shell (which already provides `AmbientBlobs`, `TopBar`, `Toaster`).

Layout: centered column, Mascot (`pose="login"`, `width={192}`) positioned behind the CTA button using `position: absolute` within a fixed-height container (`height: 108`). Button overlaps the mascot's base (`z-index: 2` vs mascot's `z-index: 1`).

```
┌─────────────────────────────────┐
│  "Vamos organizar sua bagunça"  │
│  "Joga tudo que tá na sua       │
│   cabeça. Eu cuido do resto."   │
│                                 │
│  [container height=108]         │
│    [Mascot z=1, right:2 bottom:9]│
│    [Botão "Por aqui →"  z=2]   │
└─────────────────────────────────┘
```

Button: full-width, `py-[18px]`, `rounded-[25px]`, brand gradient, `boxShadow` brand. Arrow `→` as character (not icon — purely decorative in context).

### 4.3 DumpInput — isPristine + mascot footer

`DumpInput` absorbs the text state and the `isPristine` logic. The `value`/`onChange` props are removed; `DumpPage` passes only `onSubmit(finalText: string)`.

```
EXAMPLE_TEXT = "Preciso entregar o relatório pro cliente hoje, reunião amanhã às 9h,
               ligar pro fornecedor essa semana, comprar café e pagar a conta de luz antes de sexta"

State inside DumpInput:
  const [text, setText] = useState('')
  const [isPristine, setIsPristine] = useState(true)
  const [focused, setFocused] = useState(false)

Placeholder: absolute-positioned <div> overlaying the textarea (aria-hidden).
  opacity: (isPristine && !focused) ? 0.45 : 0
  transition: opacity 0.25s ease

Textarea value: always `text` (empty string when pristine).
Textarea color: hsl(var(--text-primary)) (not manipulated; overlay handles placeholder look).
onFocus:  setFocused(true); if isPristine → setIsPristine(false)
onBlur:   setFocused(false); if !text.trim() → setIsPristine(true)  [restores placeholder if nothing typed]
onChange: setText(e.target.value)

handleSubmit:
  const finalText = isPristine ? EXAMPLE_TEXT : text
  if (!finalText.trim()) return
  onSubmit(finalText)
```

Footer replaces the current `[char-count] [Dump button]` row:

```
[Mascot pose="dump" width={240} cropped by card overflow]   [Dump button with Sparkles icon]
```

Mascot uses large width with `marginBottom: -55`, `marginLeft: -65` so the card's `overflow: hidden` crops it at the waist. Char-count removed entirely.

Dump button keeps the existing Lucide `<Sparkles>` icon (not the `✦` emoji from the reference spec — project convention is Lucide icons).

### 4.4 DumpPage — anonymous mode + 401 handler

`DumpPage` loses `value`/`setText` state (moved to `DumpInput`). Props: `{ setLoading, onSuccess, onLoginRequired }`.

On 401, `DumpPage` calls `onLoginRequired(finalText)` — it does **not** own `pendingText` or `showLoginOverlay` state itself. Those live in `Landing.jsx` (the `OnboardingShell`).

```js
if (res.status === 401 && onLoginRequired) {
  setLoading(false)
  onLoginRequired(finalText)
  return
}
if (res.status === 200) {
  const { tasks } = await res.json()
  setLoading(false)
  onSuccess(tasks ?? [])
  return
}
```

`ExampleCard` is removed from this file (import + render).

### 4.5 Landing.jsx (OnboardingShell) — pendingText + resend

`pendingText` and `showLoginOverlay` live in `Landing.jsx`. After login (auth state changes), a `useEffect` auto-resends the pending text:

```js
useEffect(() => {
  if (!user || !pendingText) return
  // resend to /api/parse-tasks with JWT
  // on 200: navigate('/dashboard', { replace: true, state: { tasks } })
}, [user, pendingText])
```

On successful resend, navigates to `/dashboard` with `state: { tasks }` so `AppShell` and `TasksPage` can display the parsed tasks immediately without a second fetch.

### 4.6 LoginModal — email + password with tabs

`LoginModal` is redesigned as a centered modal with two tabs: **Entrar** (login) and **Criar conta** (signup), using `supabase.auth.signInWithPassword` and `supabase.auth.signUp` respectively. OTP flow was dropped: Supabase's email confirmation is disabled, so signup requires no email sending.

Props: `isOpen`, `onClose`, `hideClose = false`, `context = 'default'`.

**Tabs:**
- **Entrar** — email + password fields → `signInWithPassword`
- **Criar conta** — name + email + password fields → `signUp` with `options.data.name`

Initial tab: `'criar-conta'` when `context === 'first-dump'`; `'entrar'` otherwise. Tab resets on `isOpen` or `context` change via `useEffect`.

**Password field:** eye toggle (show/hide) via `Eye`/`EyeOff` icons. Character counter (`N / 8 mín.`) shown only on the signup tab.

**Context messages** (`ContextMessage`): text above the tabs changes based on `context`:
- `'first-dump'` → "Quase lá!" / "Crie sua conta pra eu guardar essas tarefas..."
- `'default'` → "Bem-vindo de volta" / "Entra pra continuar de onde parou."

`Landing.jsx` passes `context='first-dump'` when modal opens via dump overlay; `context='default'` when coming from logout redirect. `hideClose=true` on logout redirect (no X button).

Visual: `glass-surface-strong`, `borderRadius: 22`, `maxWidth: 340`, centered over `rgba(0,0,0,0.35) blur(6px)` backdrop.

### 4.6.1 Logout redirect flow

`TopBar` sets `localStorage.setItem('dumpit_show_login', '1')` before calling `signOut()`. `Landing.jsx` reads this flag in a `useEffect` gated on `!authLoading && !user`, removes it, and sets `showLoginOnly=true` — rendering the modal with `hideClose=true` and `context='default'` over a blank background (DumpPage hidden).

### 4.10 Dark mode default

`useTheme` returns `'dark'` when no preference is stored in `localStorage` (previously fell back to `prefers-color-scheme`). The theme is applied globally via a `ThemeProvider` component in `App.jsx` that calls `useTheme()` at the router root, ensuring the `dark` class is on `<html>` from the very first render — including WelcomePage.

### 4.11 User name in TopBar + public.users

`supabase.auth.signUp` stores `name` in `options.data`, which Supabase persists in `auth.users.raw_user_meta_data`. The `handle_new_user` trigger reads `NEW.raw_user_meta_data->>'name'` and inserts it into `public.users.name` (new nullable column, migration `004_add_user_name.sql`). `TopBar` reads `user.user_metadata.name` from the auth session (no extra query) and displays it as the drawer header and avatar initial.

### 4.7 AppShell — activePage seeded from router state

When `Landing.jsx` navigates to `/dashboard` after a successful parse, it passes `state: { tasks }`. `AppShell` reads this:

```js
const fromParse = !!location.state?.tasks
const [activePage, setActivePage] = useState(fromParse ? 'tarefas' : 'dump')
```

This opens the dashboard directly on the Kanban ("tarefas") tab so the user sees their parsed tasks immediately.

### 4.8 TasksPage — seed from router state

`TasksPage` reads `location.state?.tasks` and uses it as initial state, skipping the loading spinner when tasks are already available:

```js
const seedTasks = location.state?.tasks
const [tasks, setTasks] = useState(seedTasks ?? [])
const [loading, setLoading] = useState(!seedTasks)
```

A background `useEffect` still fetches from Supabase to sync any remote state.

### 4.9 UX decision

**Options considered** (from discovery #69):

- A: Onboarding shell em `/` — login overlay no clique de Dump. Custo M, zero backend, reutiliza LoginModal existente.
- B: Parse anônimo completo → preview read-only → login ao salvar. Custo L, requer mudança de backend e TaskCard read-only mode.
- C: Captura de email na WelcomePage como primeiro passo. Custo S, contradiz framing de produto.

**Chosen**: A

**Rationale**: Option A é a única que mantém o framing "alívio antes de formulário" intacto — o usuário vê o produto e só é interrompido quando tenta persistir algo. Zero mudança de backend (parse-tasks já retorna 401 sem JWT). Reutiliza `LoginModal` que já existe como overlay em `Landing.jsx`. Option B entrega UX superior (usuário vê o Kanban antes de criar conta) mas requer mudança de contrato de API e novo componente TaskCard read-only — custo L injustificado para V1. Option C entrega a menor fricção técnica mas coloca um formulário como primeira interação — contradiz "zero configuration on the first interaction" da visão do produto.

**New tone-matrix rows proposed**:

| Contexto | Tom | Exemplo |
|----------|-----|---------|
| WelcomePage — headline | Direto, acolhedor, sem imperativo | "Vamos organizar sua bagunça" |
| WelcomePage — subtítulo | Aliviador, promessa simples | "Joga tudo que tá na sua cabeça. Eu cuido do resto." |
| WelcomePage — CTA | Convite, não instrução | "Por aqui →" |
| DumpPage — placeholder funcional | Guia implícito, não tutorial | EXAMPLE_TEXT em 35% opacity |

## 5. Files

| Path | Action | Notes |
|------|--------|-------|
| `src/pages/WelcomePage.jsx` | Create | Nova tela de boas-vindas; props: `{ onContinue }` |
| `src/pages/Landing.jsx` | Modify | OnboardingShell: hasSeenWelcome routing, showLoginOnly logout redirect, pendingText + resend pós-login, AnimatePresence slide transition |
| `src/components/dump/DumpInput.jsx` | Modify | isPristine + overlay placeholder, mascot footer cropped, remove char-count |
| `src/pages/DumpPage.jsx` | Modify | onLoginRequired prop, 401 handler delegates up, onSuccess(tasks), remove ExampleCard |
| `src/components/auth/LoginModal.jsx` | Modify | Email+password tabs (Entrar/Criar conta), context messages, hideClose prop, password eye toggle, signup char counter |
| `src/hooks/useAuth.js` | Modify | Substitui signInWithEmail/verifyOtp por signInWithPassword/signUp |
| `src/App.jsx` | Modify | ThemeProvider wrapping RouterProvider; AppShell semeia activePage de location.state?.tasks |
| `src/hooks/useTheme.js` | Modify | Dark mode como padrão quando nenhuma preferência salva |
| `src/pages/TasksPage.jsx` | Modify | Semeia tasks iniciais de location.state?.tasks; skips loading spinner quando tasks disponíveis |
| `src/components/layout/TopBar.jsx` | Modify | Logout sets localStorage flag; drawer exibe nome do usuário; avatar inicial do nome |
| `src/components/tasks/KanbanBoard.jsx` | Modify | Fix soft delete: adiciona .then() para disparar a query supabase |
| `supabase/migrations/004_add_user_name.sql` | Create | Adiciona coluna name em public.users; atualiza handle_new_user com SECURITY DEFINER + exception handler + name |
| `src/components/dump/ExampleCard.jsx` | Delete | Absorvido pelo isPristine overlay placeholder |

## 6. Acceptance

- [ ] Primeiro acesso (localStorage limpo): `/` mostra WelcomePage em dark mode — sem modal de login.
- [ ] Clicar "Por aqui →" navega para DumpPage sem exigir conta.
- [ ] DumpPage mostra `EXAMPLE_TEXT` como overlay em ~45% de opacidade no estado inicial.
- [ ] Focar o textarea limpa o overlay e permite digitação; desfocando sem digitar, overlay volta.
- [ ] Clicar "Dump" sem conta → LoginModal overlay aparece sobre DumpPage com context "Quase lá!" e aba "Criar conta" pré-selecionada.
- [ ] Criar conta via email+senha → tasks parseadas aparecem na TasksPage imediatamente, sem redigitar, na aba "tarefas".
- [ ] Login via email+senha (conta existente) no overlay → mesmo fluxo acima.
- [ ] Segundo acesso (hasSeenWelcome=true, sem sessão): `/` mostra DumpPage diretamente — sem WelcomePage.
- [ ] Usuário logado abrindo `/` → redirect imediato para `/dashboard`.
- [ ] Logout → tela limpa com LoginModal sem X, context "Bem-vindo de volta", aba "Entrar" pré-selecionada.
- [ ] Exclusão de task persiste após navegar para dump e voltar.
- [ ] Mascot (`pose="dump"`) visível no footer do DumpInput.
- [ ] Char-count (`0 / 1000`) não aparece no DumpInput.
- [ ] `ExampleCard` não renderiza em nenhuma tela.
- [ ] Nome do usuário aparece no drawer do TopBar; avatar exibe inicial do nome.
- [ ] Dark mode ativo por padrão em primeiro acesso; preferência salva ao trocar.

## 7. Risks

| Risk | Mitigation |
|------|------------|
| DumpPage perde acesso ao texto se usuário demorar no LoginModal e o estado for perdido | `pendingText` vive em `Landing.jsx` (OnboardingShell); só é limpo após resend bem-sucedido |
| `hasSeenWelcome` não existe para usuários que já criaram conta antes deste deploy | Na primeira visita pós-deploy, verão WelcomePage uma vez — comportamento aceitável para V1 |
| `OnboardingShell` precisa dos mesmos wrappers de layout que `AppShell` | `Landing.jsx` inclui `AmbientBlobs`, `Toaster`, e `LoadingOverlay` |
| `location.state?.tasks` persiste na URL history após navegação | Sem impacto funcional; a navegação subsequente não carrega state anterior |

## 8. Rollout

Single PR, squash merge. Testar manualmente no preview do Cloudflare Pages antes de merge. Sem flag, sem phased rollout — mudança de rota é atômica.

Pós-merge: verificar que usuários com conta ativa conseguem entrar via `/dashboard` normalmente (AuthGuard path não mudou).
