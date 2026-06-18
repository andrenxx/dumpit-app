# Spec 023 — UI redesign v2 — DumpPage components

| Field    | Value                                                                                |
| -------- | ------------------------------------------------------------------------------------ |
| Issue    | [#23](https://github.com/andrenxx/dumpit/issues/23)                                  |
| Branch   | `feat/23-ui-redesign-v2-dumppage-components`                                         |
| Status   | Implemented — merged to main                                                          |
| Type     | feature                                                                               |

## 1. Context

Child of issue #19 (spec 019). Depends on spec #21 (tokens) and spec #22 (App shell), both merged. Parallelisable with spec #24 (TasksPage). Rebuilds four DumpPage-related components with the Liquid Glass aesthetic: DumpInput (glass wrapper + shadcn Textarea + gradient button), ExampleCard (Framer Motion hover/tap + mint label), FreemiumBanner (AnimatePresence height slide), LoadingOverlay (blob-morph icon + Framer Motion progress bar).

## 2. Goals

- `DumpInput.jsx`: `motion.div` glass-surface-strong wrapper with focus lift; shadcn `<Textarea>` with no border/shadow/ring; character count; gradient "Dump ✦" `<Button>`.
- `ExampleCard.jsx`: Framer Motion `whileHover={{ y: -1 }}` / `whileTap={{ scale: 0.98 }}`; mint-tinted glass card; mint label badge.
- `FreemiumBanner.jsx`: `AnimatePresence` with `motion.div` height `0 → 'auto'` and opacity slide; coral-tinted glass card; "Assinar" button visual-only stub.
- `LoadingOverlay.jsx`: `AnimatePresence` fade-in/out; blob-morph icon (84px `motion.div` with brand-to-coral gradient + `animate-blob-morph`); Framer Motion progress bar filling over ~2 s.
- `npm run lint` and `npm run build` pass.

## 2.5 Validation strategy

Run `npm run dev`, log in, navigate to DumpPage. Verify:
1. DumpInput renders as a glass card (translucent, blurred); Textarea has no visible border or ring; gradient "Dump ✦" button shows.
2. Click the ExampleCard — it fills DumpInput and lifts/scales on hover/tap.
3. Submit DumpInput — LoadingOverlay appears; blob-morph icon animates; progress bar fills; overlay fades out after completion.
4. On free-plan limit exceeded — FreemiumBanner slides open (height animation visible).
Run `npm run build` — exits 0.

## 3. Non-goals

- TasksPage components (chunk #24).
- Payment logic for FreemiumBanner "Assinar" button.
- DumpPage heading changes (out of scope — not a component in this list).
- App.jsx changes (done in #22).

## 4. Design

### 4.1 DumpInput.jsx

Replace the flat `div` wrapper and plain `textarea` with a glass card:

```jsx
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'

const MAX_LENGTH = 1000

export function DumpInput({ value, onChange, onSubmit, disabled, inputRef }) {
  const [focused, setFocused] = useState(false)

  return (
    <motion.div
      animate={{ y: focused ? -2 : 0, boxShadow: focused
        ? '0 10px 28px rgba(91,61,242,0.18)'
        : '0 6px 18px rgba(91,61,242,0.12)' }}
      transition={{ duration: 0.2 }}
      className="glass-surface-strong glass-inset-highlight rounded-[26px]"
      style={{ padding: '18px 18px 14px' }}
    >
      <Textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={MAX_LENGTH}
        placeholder="ex: reunião amanhã às 9h com o cliente, relatório urgente pra hoje..."
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="border-none shadow-none focus-visible:ring-0 resize-none min-h-[150px] text-[14px] leading-[1.65] bg-transparent placeholder:text-text-hint"
        style={{ fontFamily: 'inherit' }}
      />
      <div className="flex items-center justify-between pt-3 mt-2"
           style={{ borderTop: '0.5px solid rgba(91,61,242,0.08)' }}>
        <span className="text-[11px] text-text-hint">
          {value.length} / {MAX_LENGTH}
        </span>
        <Button
          onClick={onSubmit}
          disabled={disabled}
          size="sm"
          className="rounded-[18px] shadow-glass-button text-[13px] font-medium"
          style={{
            background: 'linear-gradient(135deg, #5B3DF2, #4427D6)',
            fontFamily: 'inherit',
            border: 'none',
          }}
        >
          Dump ✦
        </Button>
      </div>
    </motion.div>
  )
}
```

### 4.2 ExampleCard.jsx

```jsx
import { motion } from 'framer-motion'

const EXAMPLE_TEXT = 'Preciso entregar o relatório pro cliente hoje, reunião amanhã às 9h, ' +
  'ligar pro fornecedor essa semana, comprar café e pagar a conta de luz antes de sexta'

export function ExampleCard({ onFill }) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onFill(EXAMPLE_TEXT)}
      className="glass-surface rounded-[20px] cursor-pointer"
      style={{ padding: '14px 16px', boxShadow: '0 3px 12px rgba(91,61,242,0.06)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-semibold tracking-wider text-text-hint uppercase">
          💡 Clique pra testar
        </span>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(0,210,160,0.16)', color: '#1A8A6C' }}>
          exemplo
        </span>
      </div>
      <p className="text-[13px] text-text-secondary leading-relaxed">
        &ldquo;{EXAMPLE_TEXT}&rdquo;
      </p>
    </motion.div>
  )
}
```

### 4.3 FreemiumBanner.jsx

```jsx
import { AnimatePresence, motion } from 'framer-motion'

export function FreemiumBanner({ visible = true }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{ overflow: 'hidden' }}
        >
          <div className="glass-surface rounded-[20px] flex items-start gap-3"
               style={{ padding: '14px 16px', background: 'rgba(255,111,82,0.08)' }}>
            <div className="text-[18px] flex-shrink-0 pt-0.5">✦</div>
            <div>
              <strong className="text-[13px] font-medium block mb-1">
                Você já usou seu crédito gratuito
              </strong>
              <p className="text-[12px] text-text-secondary leading-relaxed">
                A IA é paga. O Kanban manual é pra sempre grátis.<br />
                R$25/mês pra continuar usando a IA.
              </p>
              <button
                className="mt-2.5 px-4 py-2 rounded-[10px] text-[12px] font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #5B3DF2, #4427D6)', border: 'none', cursor: 'pointer' }}
              >
                Assinar plano pago
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

### 4.4 LoadingOverlay.jsx

```jsx
import { AnimatePresence, motion } from 'framer-motion'

export function LoadingOverlay({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'absolute', inset: 0, zIndex: 50,
            background: 'rgba(250,249,252,0.92)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 20, textAlign: 'center', padding: 40,
          }}
        >
          {/* blob-morph icon */}
          <motion.div
            className="animate-blob-morph"
            style={{
              width: 84, height: 84,
              background: 'linear-gradient(135deg, #5B3DF2, #FF6F52)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 32 }}>✦</span>
          </motion.div>

          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#1A1530', marginBottom: 6 }}>
              Organizando suas tarefas...
            </div>
            <div style={{ fontSize: 13, color: '#5E5878' }}>
              A IA está lendo e classificando tudo
            </div>
          </div>

          {/* progress bar */}
          <div style={{ width: 160, height: 3, background: 'rgba(91,61,242,0.12)', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #5B3DF2, #FF6F52)', borderRadius: 2 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

## 4.5 UX decision

N/A — discovery marked ux: not-applicable.

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `src/components/dump/DumpInput.jsx` | modify | glass wrapper, shadcn Textarea, gradient Button |
| `src/components/dump/ExampleCard.jsx` | modify | Framer Motion whileHover/whileTap, mint label |
| `src/components/ui/FreemiumBanner.jsx` | modify | AnimatePresence height slide-open |
| `src/components/ui/LoadingOverlay.jsx` | modify | blob-morph icon, Framer Motion progress bar |

## 6. Acceptance

- [ ] DumpInput is a glass card (glass-surface-strong) that lifts (`y: -2`) on focus.
- [ ] Textarea inside DumpInput has no visible border or focus ring.
- [ ] Gradient "Dump ✦" button uses brand-to-brand-deep gradient.
- [ ] ExampleCard lifts on hover (`y: -1`) and scales on tap (`scale: 0.98`).
- [ ] ExampleCard has a mint-tinted "exemplo" label badge.
- [ ] FreemiumBanner slides open (height animation) via AnimatePresence.
- [ ] LoadingOverlay: blob-morph icon uses `animate-blob-morph` class.
- [ ] LoadingOverlay: progress bar fills from 0% to 100% over ~2 s.
- [ ] LoadingOverlay fades in/out via AnimatePresence.
- [ ] `npm run lint` exits 0.
- [ ] `npm run build` exits 0.

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| `animate-blob-morph` Tailwind animation not found | Keyframe added in spec #21 (merged); must rebase on main |
| `motion.div animate={{ height: 'auto' }}` — Framer Motion does not animate `height: auto` natively via `animate` prop | Use `initial/animate/exit` for height only inside `AnimatePresence`; Framer Motion 10+ supports `height: 'auto'` animations via layout animations or the `motion` component with `overflow: hidden` on the parent — confirmed working with `overflow: 'hidden'` on the outer motion.div |
| `Textarea` className merging conflicts with shadcn defaults | `cn()` utility merges with `twMerge`; `border-none shadow-none focus-visible:ring-0` will override shadcn defaults via Tailwind Merge's last-wins rule |
| `FreemiumBanner` `visible` prop not currently wired in DumpPage | Existing DumpPage wires FreemiumBanner without a prop today; ensure the parent passes `visible={showBanner}` or that the default `visible={true}` is acceptable |

**Decomposition verdict:** single

All four components are coupled to the DumpPage UX flow: DumpInput → submit → LoadingOverlay; ExampleCard fills DumpInput; FreemiumBanner appears after usage limit. Shipping any subset produces an incoherent DumpPage. The files are disjoint from TasksPage (chunk #24) — no cross-chunk conflict.

## 8. Rollout

Single commit:

1. `feat(#23): DumpPage — DumpInput, ExampleCard, FreemiumBanner, LoadingOverlay glass redesign`

**Pre-conditions:** main must carry specs #21 (tokens + animate-blob-morph) and #22 (App shell). Rebase before implementing.

---

## 9. Post-implementation additions

### 9.1 Mascot integration in ExampleCard

`ExampleCard` gained a `Mascot` component (`src/components/ui/Mascot.jsx`) rendered at the bottom-left of the card. The SVG used is `public/mascote/mascote-dump.svg` (viewBox 1536×1024, aspect ratio 1.5).

**Crop strategy:** the card's own `overflow:hidden` + `rounded-[22px]` clips the mascot at the bottom instead of a separate inner container. The mascot image (`width: 230px`) is wider than its wrapper (`width: 110px`), so it bleeds left/right; `marginLeft: -12px` pulls the character into frame and `marginBottom: -45px` pushes the feet below the card edge so the rounded corner produces the natural bottom crop.

Key constants in `ExampleCard.jsx`:
```js
const MASCOT_WIDTH = 230           // rendered image width
const MASCOT_CONTAINER_WIDTH = 110 // visible window (narrower than image)
// marginBottom: -45 on the container (fine-tuned visually)
```

**`Mascot` component contract:** `flexShrink: 0` and `minWidth: width` are set inside the component so flex containers never shrink the image below its explicit width — a required invariant for overflow-crop wrappers to work.
