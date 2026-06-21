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
3. DumpPage shows `EXAMPLE_TEXT` as a functional placeholder (35% opacity); clears on first focus; submits example text if user never edits.
4. Clicking "Dump" without an account triggers a `LoginModal` overlay in-place (no redirect).
5. After login, the pending text is resubmitted automatically — user arrives at TasksPage with tasks visible, no retyping.
6. Returning users (logged out, `hasSeenWelcome = true`) land directly on anonymous DumpPage — no WelcomePage repeat.
7. Logged-in users navigating to `/` are redirected to `/dashboard` immediately.
8. `ExampleCard.jsx` is removed; mascot (`pose="dump"`) appears in the DumpInput footer instead.

## 2.5 Validation strategy

Manual E2E browser test covering four flows:

1. **First-time anonymous**: clear localStorage → open `/` → WelcomePage visible → click "Por aqui →" → DumpPage visible (no account modal) → textarea shows example text at 35% opacity → click Dump without editing → LoginModal overlay appears → login → TasksPage with tasks parsed from example text.

2. **First-time with edit**: same as above but type custom text before clicking Dump → after login → TasksPage with custom text tasks.

3. **Returning anonymous** (`hasSeenWelcome=true`, no session): open `/` → DumpPage directly (no WelcomePage) → same Dump→overlay→login→TasksPage flow.

4. **Logged-in user**: active session → open `/` → immediate redirect to `/dashboard`.

No automated tests added in this spec — all flows are UI-driven and require Supabase auth.

## 3. Non-goals

- Anonymous session persistence to the database (Option B from discovery).
- Email capture on WelcomePage before first dump (Option C from discovery).
- Changes to `TasksPage.jsx`, `KanbanBoard.jsx`, or any Kanban component.
- Changes to `functions/api/parse-tasks.js` — it already returns 401 without a JWT.
- Changes to `LoginModal.jsx` visual or logic.
- Analytics / conversion tracking.
- Cross-device sync of `hasSeenWelcome` (localStorage only, by design).
- `anonymousSession.js` is created but the generated ID is not sent to the backend in V1.

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

Textarea value:   isPristine ? EXAMPLE_TEXT : text
Textarea color:   isPristine ? 'rgba(237,234,245,0.35)' : 'hsl(var(--text-primary))'
onFocus:          if isPristine → setIsPristine(false), leave text=''
onChange:         setText(e.target.value)

handleSubmit (called by button or passed up):
  const finalText = isPristine ? EXAMPLE_TEXT : text
  if (!finalText.trim()) return
  onSubmit(finalText)
```

Footer replaces the current `[char-count] [Dump button]` row:

```
[Mascot pose="dump" width={104}]        [Dump button with Sparkles icon]
```

Mascot: `marginTop: -6`, `marginLeft: -3`, `filter: drop-shadow(...)`. Char-count removed entirely.

Dump button keeps the existing Lucide `<Sparkles>` icon (not the `✦` emoji from the reference spec — project convention is Lucide icons).

### 4.4 DumpPage — anonymous mode + 401 handler

`DumpPage` loses `value`/`setText` state (moved to `DumpInput`). Gains:

```js
const [pendingText, setPendingText] = useState(null)
const [showLoginOverlay, setShowLoginOverlay] = useState(false)
```

`handleSubmit(finalText)`:

```js
async function handleSubmit(finalText) {
  setLoading(true)
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/parse-tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({ text: finalText }),
    })

    if (res.status === 401) {
      setPendingText(finalText)
      setShowLoginOverlay(true)
      setLoading(false)
      return
    }
    if (res.status === 200) {
      setLoading(false)
      onSuccess()
      return
    }
    if (res.status === 402) {
      setLoading(false)
      setShowFreemiumBanner(true)
      return
    }
    setLoading(false)
    showError()
  } catch {
    setLoading(false)
    showError()
  }
}
```

After login via overlay, `onLoginSuccess` is called. At that point:
1. Retrieve fresh session
2. Resend `pendingText` to `/api/parse-tasks` with JWT
3. On 200 → `onSuccess()` (navigates to TasksPage)
4. Clear `pendingText` and `showLoginOverlay`

`LoginModal` rendered as overlay when `showLoginOverlay=true`:

```jsx
{showLoginOverlay && (
  <LoginModal
    isOpen
    onClose={() => { setShowLoginOverlay(false); setPendingText(null) }}
    onSuccess={handlePostLoginResend}
  />
)}
```

`ExampleCard` is removed from this file (import + render).

### 4.5 UX decision

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
| `src/pages/Landing.jsx` | Modify | Vira OnboardingShell: hasSeenWelcome routing, WelcomePage, anonymous DumpPage |
| `src/components/dump/DumpInput.jsx` | Modify | isPristine state, EXAMPLE_TEXT, mascot footer, remove char-count, API muda de value/onChange para onSubmit(finalText) |
| `src/pages/DumpPage.jsx` | Modify | pendingText, showLoginOverlay, 401 handler, resend pós-login, remove ExampleCard |
| `src/lib/anonymousSession.js` | Create | `getOrCreateAnonymousId()` — crypto.randomUUID em localStorage; não enviado ao backend em V1 |
| `src/components/dump/ExampleCard.jsx` | Delete | Absorvido pelo isPristine placeholder |

## 6. Acceptance

- [ ] Primeiro acesso (localStorage limpo): `/` mostra WelcomePage — sem modal de login.
- [ ] Clicar "Por aqui →" navega para DumpPage sem exigir conta.
- [ ] DumpPage mostra `EXAMPLE_TEXT` em 35% de opacidade no estado inicial.
- [ ] Focar o textarea limpa o texto de exemplo e permite digitação.
- [ ] Clicar "Dump" sem conta → LoginModal overlay aparece sobre DumpPage (sem redirect para outra rota).
- [ ] Fazer login no overlay → tasks parseadas do texto (exemplo ou digitado) aparecem na TasksPage, sem redigitar.
- [ ] Segundo acesso (hasSeenWelcome=true, sem sessão): `/` mostra DumpPage diretamente — sem WelcomePage.
- [ ] Usuário logado abrindo `/` → redirect imediato para `/dashboard`.
- [ ] Mascot (`pose="dump"`) visível no footer do DumpInput.
- [ ] Char-count (`0 / 1000`) não aparece no DumpInput.
- [ ] `ExampleCard` não renderiza em nenhuma tela.

## 7. Risks

| Risk | Mitigation |
|------|------------|
| DumpPage perde acesso ao texto se usuário demorar no LoginModal e o estado for perdido | `pendingText` vive em `DumpPage` state; só é limpo após resend bem-sucedido |
| `LoginModal` existente não expõe `onSuccess` callback | Verificar a interface atual de `LoginModal`; adicionar prop `onSuccess` se necessário (mudança mínima) |
| `hasSeenWelcome` não existe para usuários que já criaram conta antes deste deploy | Na primeira visita pós-deploy, verão WelcomePage uma vez — comportamento aceitável para V1 |
| `OnboardingShell` precisa dos mesmos wrappers de layout que `AppShell` | `Landing.jsx` já tem `AmbientBlobs`; verificar se `TopBar` e `Toaster` são necessários neste contexto |

## 8. Rollout

Single PR, squash merge. Testar manualmente no preview do Cloudflare Pages antes de merge. Sem flag, sem phased rollout — mudança de rota é atômica.

Pós-merge: verificar que usuários com conta ativa conseguem entrar via `/dashboard` normalmente (AuthGuard path não mudou).
