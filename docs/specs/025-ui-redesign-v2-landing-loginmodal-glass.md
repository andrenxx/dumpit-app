# Spec 025 — UI redesign v2 — Landing page and LoginModal glass aesthetic

| Field    | Value                                                                                 |
| -------- | ------------------------------------------------------------------------------------- |
| Issue    | [#29](https://github.com/andrenxx/dumpit/issues/29)                                   |
| Branch   | `feat/29-ui-redesign-v2-landing-loginmodal-glass`                                     |
| Status   | Implemented — merged to main                                                           |
| Type     | feature                                                                                |

## 1. Context

Specs #21–#24 delivered the full Liquid Glass redesign for the authenticated shell (TopBar, BottomNav, DumpPage, TasksPage). The unauthenticated entry points — `Landing.jsx` and `LoginModal.jsx` — were explicitly excluded and still use a plain white background with an indigo button. This breaks visual consistency the moment the user opens the product for the first time.

A ref-forwarding bug in `src/components/ui/textarea.jsx` was also discovered during testing: shadcn's `Textarea` is a plain function component, so `ref={inputRef}` passed from `DumpInput` is silently dropped, breaking auto-focus. This is included here as it was found during the same testing session.

## 2. Goals

- `src/pages/Landing.jsx`: replace plain white background with `AmbientBlobs` + `bg-bg-app`; center content in a `glass-surface` card; use brand pill logo ("dump **it**"); replace indigo button with brand gradient button matching DumpPage's "Dump ✦" style.
- `src/components/auth/LoginModal.jsx`: replace `bg-white rounded-lg` modal with `glass-surface-strong glass-inset-highlight` panel; update overlay to use `backdrop-blur`; style inputs and buttons to match glass aesthetic.
- `src/components/ui/textarea.jsx`: wrap with `React.forwardRef` so `ref` prop is forwarded to the underlying `<textarea>`.

## 2.5 Validation strategy

Run `npm run build` (passes). Open `http://localhost:8788`:
1. Landing renders with ambient blobs, glass card, brand logo, gradient button — no plain white.
2. Click "Entrar" — modal opens with glass panel + backdrop blur overlay.
3. Type email, submit — OTP code step renders with the same glass styling.
4. After login, DumpPage textarea auto-focuses correctly (ref forwarding fix).

## 3. Non-goals

- Auth flow logic (magic link, OTP) — unchanged.
- New auth providers.
- Animation changes to the modal entry/exit (keep existing `modalVariants`).

## 4. Design

### 4.1 Landing.jsx

```jsx
import { AmbientBlobs } from '../components/layout/AmbientBlobs'
import { LoginModal } from '../components/auth/LoginModal'

export function Landing() {
  // ... existing state/hooks ...

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#FAF9FC' }}>
      <AmbientBlobs />
      <div className="glass-surface glass-inset-highlight rounded-[28px] flex flex-col items-center text-center"
           style={{ padding: '40px 36px', maxWidth: 340, width: '90%', boxShadow: '0 8px 28px rgba(91,61,242,0.14)' }}>
        {/* brand pill logo */}
        <div className="flex items-center gap-1.5 text-[22px] font-medium tracking-tight text-text-primary mb-2">
          dump<span className="px-[8px] py-[3px] rounded-[10px] bg-brand/[0.07] border border-brand/[0.12] text-brand text-[20px]">it</span>
        </div>
        <p className="text-[13px] text-text-secondary mb-8">dump it, nós organizamos</p>
        <button
          onClick={() => setShowLogin(true)}
          className="w-full rounded-[18px] py-3 text-[14px] font-medium text-white shadow-glass-button"
          style={{ background: 'linear-gradient(135deg, #5B3DF2, #4427D6)', border: 'none', cursor: 'pointer' }}
        >
          Entrar
        </button>
      </div>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  )
}
```

### 4.2 LoginModal.jsx

- Overlay: `bg-black/30 backdrop-blur-sm` (softer, not `bg-black/50`).
- Panel: replace `bg-white rounded-lg p-8` with `glass-surface-strong glass-inset-highlight rounded-[24px]` + `padding: '32px 28px'` + `boxShadow: '0 12px 36px rgba(91,61,242,0.18)'`.
- Title `h2`: `text-[18px] font-semibold text-text-primary`.
- Close button: `text-text-hint hover:text-text-secondary`.
- Error text: keep `text-red-500 text-sm`.
- Inputs (`<Input>`): already glass-ish from shadcn defaults; no change needed.
- Submit button (`<Button>`): already uses brand gradient from the shadcn Button component (set in spec #21); keep as-is.

### 4.3 Textarea.jsx forwardRef fix

```jsx
const Textarea = React.forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
})
```

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `src/pages/Landing.jsx` | modify | AmbientBlobs, glass card, brand logo, gradient button |
| `src/components/auth/LoginModal.jsx` | modify | glass-surface-strong panel, backdrop-blur overlay |
| `src/components/ui/textarea.jsx` | modify | React.forwardRef fix |

## 6. Acceptance

- [ ] Landing has AmbientBlobs, glass card centered, brand pill "dump it" logo.
- [ ] Landing "Entrar" button uses brand gradient, no plain indigo.
- [ ] LoginModal overlay uses `backdrop-blur`.
- [ ] LoginModal panel uses `glass-surface-strong` (glass effect visible).
- [ ] DumpInput textarea auto-focuses (forwardRef fix confirmed by clicking ExampleCard).
- [ ] `npm run build` exits 0.

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| `AmbientBlobs` uses `position:fixed` with `zIndex:-10`; on Landing the root is `min-h-screen` not fixed — blobs may not show | Set `position:relative` on root or use `zIndex:0` for blobs on Landing |
| `React.forwardRef` HMR — Vite can stale-cache the forwardRef object during dev | Hard reload after change; no production impact |

## 8. Rollout

Single commit:

1. `feat(#29): Landing + LoginModal glass redesign + Textarea forwardRef fix`

**Decomposition verdict:** single

Three files, all visual-only, ship together as one coherent "unauthenticated shell" pass.

---

## 9. Post-implementation additions

### 9.1 Mascot integration in Landing

`Landing.jsx` gained a `Mascot` component (`src/components/ui/Mascot.jsx`) floating above the glass card. The SVG used is `public/mascote/mascote-login.svg` (viewBox 2048×1365, aspect ratio 1.5003).

The mascot renders in full (no crop) and overlaps the card via a negative `marginBottom`, so the card's `pt-14` creates visual space for the mascot's lower body to tuck behind the card top edge.

```jsx
<Mascot
  pose="login"
  width={270}
  className="relative z-10 opacity-[0.92]"
  style={{
    marginBottom: -100,
    filter: 'drop-shadow(0 14px 24px rgba(91,61,242,0.18))',
  }}
/>
```

### 9.2 Button component on Landing

The original spec used a plain `<button>`. The implementation uses the shadcn `<Button>` component (from spec #21) for both "Entrar com email" and "Continuar com Google" actions, with inline `style` overrides for gradient and glass backgrounds. The Google button includes an inline SVG Google logo.

### 9.3 SVG assets

Three mascot SVGs were added under `public/mascote/`:
- `mascote-login.svg` — login screen pose (waving)
- `mascote-dump.svg` — dump screen pose (writing on clipboard), transparent background
- `mascote-kanban.svg` — kanban screen pose (arms crossed)

`mascote-login.svg` and `mascote-kanban.svg` originally carried `preserveAspectRatio="none"` which caused distortion; this was corrected to `"xMidYMid meet"`. The `Mascot` component sets `objectFit: 'contain'` as a safeguard.
