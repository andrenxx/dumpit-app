# Spec 058 — Brand palette swap: indigo → teal/petróleo

| Field  | Value                                                                  |
| ------ | ---------------------------------------------------------------------- |
| Issue  | [#58](https://github.com/andrenxx/dumpit/issues/58)                    |
| Branch | `feat/58-brand-color-is-indigo-swap-to-teal-petro`                     |
| Status | Draft — awaiting review                                                |
| Type   | feature                                                                |

## 1. Context

The brand color is indigo (`#5B3DF2`). The product direction is moving to
teal/petróleo (`#0E7C9E`). This is a pure accent-color swap — no layout,
spacing, typography, or glassmorphism changes.

Discovery #58 was blocked until dark mode infrastructure (spec #057) shipped,
because both the light brand swap and the dark token update must land on the
consolidated HSL CSS var foundation. Spec #057 merged first; this spec applies
the palette on top of it.

Today there are 29 occurrences of hardcoded indigo values (`#5B3DF2`,
`#4427D6`, `rgba(91,61,242,...)`) spread across 13 component files. The CSS
token layer (`src/index.css`) already declares `--brand` and `--brand-deep` via
HSL vars (established by #057), but the components never adopted them — they
inline the hex directly. This spec fixes both: updates the token values and
replaces every in-component hardcode with the canonical var.

## 2. Goals

- `--brand` and `--brand-deep` in `src/index.css` `:root` reflect teal values.
- `--brand` in `html.dark` reflects the adjusted teal (`#1B9DC6`) for legibility on dark backgrounds.
- Every hardcoded `#5B3DF2`, `#4427D6`, and `rgba(91,61,242,...)` occurrence in `src/` is replaced with `hsl(var(--brand))` or a named shadow var.
- Three named shadow CSS vars (`--shadow-brand-button`, `--shadow-brand-card`, `--shadow-brand-input`) eliminate duplicated rgba values across themes.
- `AmbientBlobs` blob-1 color is driven by `hsl(var(--brand))` so it updates with theme and palette automatically.
- Build passes clean with no new lint errors.

## 2.5 Validation strategy

Two verification passes:

1. **Token pass (mechanical):** after the change, `grep -r "5B3DF2\|4427D6\|rgba(91" src/` must return zero results.
2. **Visual pass (manual):** open the app in both light and dark mode; confirm every surface that was indigo (primary button, active nav, input border focus ring, progress card gradient, logo "it" badge, ambient blob-1, card highlights) now shows teal. No regression on coral, mint, yellow, or badge colors.

The mascot contrast check is a sub-step of the visual pass: open the Kanban view with dark mode active and verify the mascot SVG outlines are legible against the dark card background.

## 3. Non-goals

- Changes to the glassmorphism system, layout, spacing, typography, or border-radius.
- Updating mascot SVG source files — only a CSS `filter: brightness()` override is permitted if contrast fails, and only if visually required.
- Redesigning the ambient blob positions, sizes, or blur values.
- Updating the `coral`, `mint`, or `yellow` semantic colors.
- Migrating badge hex tokens (`--badge-urgente-bg`, etc.) to HSL — deferred to a future spec.
- Any change to `tailwind.config.js` — the Tailwind shadow utilities already use `hsl(var(--brand) / 0.XX)` from spec #057 and will update automatically when the CSS var changes.

## 4. Design

### 4.1 Token update — `src/index.css`

Update the three brand entries and introduce three shadow vars:

```css
/* `:root {}` — light mode */
--brand:      199 86% 33%;   /* #0E7C9E */
--brand-deep: 196 82% 25%;   /* #0A5C76 */

/* New shadow vars — use in components instead of rgba() */
--shadow-brand-button: rgba(14, 124, 158, 0.25);
--shadow-brand-card:   rgba(14, 124, 158, 0.22);
--shadow-brand-input:  rgba(14, 124, 158, 0.22);
```

```css
/* `html.dark {}` — dark mode */
--brand:      195 78% 44%;   /* #1B9DC6 */
--brand-deep: 199 86% 33%;   /* #0E7C9E */

/* Shadow vars in dark override block */
--shadow-brand-button: rgba(27, 157, 198, 0.35);
--shadow-brand-card:   rgba(27, 157, 198, 0.30);
--shadow-brand-input:  rgba(27, 157, 198, 0.28);
```

Also update the shadcn `--primary` slot to match (it mirrors `--brand`):

```css
/* `:root {}` */
--primary: 199 86% 33%;

/* `html.dark {}` */
--primary: 195 78% 44%;
```

### 4.2 Component mechanical sweep

Replace every hardcoded indigo occurrence in the 13 component files:

| Pattern | Replacement |
| ------- | ----------- |
| `#5B3DF2` | `hsl(var(--brand))` |
| `#4427D6` | `hsl(var(--brand-deep))` |
| `rgba(91,61,242,0.25)` or similar | `var(--shadow-brand-button)` / `var(--shadow-brand-card)` / `var(--shadow-brand-input)` (match by context) |
| `background: '#5B3DF2'` (inline JSX) | `background: 'hsl(var(--brand))'` |

Shadow context rules:
- **button** → `--shadow-brand-button` (primary action buttons)
- **card/modal** → `--shadow-brand-card` (cards, modals, progress surfaces)
- **input focus** → `--shadow-brand-input` (DumpInput focus ring)

### 4.3 AmbientBlobs

Replace the blob-1 inline `background: '#5B3DF2'` with `background: 'hsl(var(--brand))'`. The blob will now inherit the correct teal in light mode and the adjusted teal in dark mode automatically.

```jsx
// Before
<div style={{ ..., background:'#5B3DF2', opacity:0.22 }} />

// After
<div style={{ ..., background:'hsl(var(--brand))', opacity:0.22 }} />
```

### 4.4 Mascot contrast (conditional)

The mascot SVGs live in `public/mascote/` and are rendered via `<img>`. If the
visual pass (§2.5) reveals the dark outlines lose contrast against the dark card
background, add this CSS rule to `src/index.css`:

```css
html.dark .mascot-img {
  filter: brightness(1.15);
}
```

And add `className="mascot-img"` to the `<img>` in `Mascot.jsx`. This is
conditional — skip if contrast is acceptable as-is.

## 4.5 UX decision

**Options considered** (from discovery #58):

- A: CSS-var-only swap — update `:root` tokens only; leave all hardcoded in-component values unchanged.
- B: Mechanical find-replace — update tokens + replace all 29 in-component hardcodes, no shadow var indirection.
- C: Token update + shadow vars + full component sweep — adds three named shadow CSS vars to eliminate duplicated rgba values, recommended by the discovery.

**Chosen**: C

**Rationale**: Option A would leave 29 hardcodes pointing at the old teal hex (not indigo, but still not driven by the var), making future palette iterations as painful as the current one. Option B is complete but leaves shadow rgba values duplicated across the theme blocks. Option C costs ~10 extra lines (the three shadow vars) and pays forward: the next palette swap or dark mode tuning touches only `src/index.css`. The discovery explicitly recommends it.

**New tone-matrix rows proposed**: N/A — no new copy contexts introduced.

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `src/index.css` | modified | Update `--brand`, `--brand-deep`, `--primary` in `:root` and `html.dark`; add `--shadow-brand-*` vars |
| `src/components/layout/AmbientBlobs.jsx` | modified | blob-1 background → `hsl(var(--brand))` |
| `src/components/ui/LoadingOverlay.jsx` | modified | Replace hardcoded indigo |
| `src/components/ui/FreemiumBanner.jsx` | modified | Replace hardcoded indigo |
| `src/components/tasks/TaskModal.jsx` | modified | Replace hardcoded indigo |
| `src/components/tasks/ProgressCard.jsx` | modified | Replace hardcoded indigo + shadow rgba |
| `src/components/tasks/KanbanColumn.jsx` | modified | Replace hardcoded indigo |
| `src/components/tasks/NewTaskButton.jsx` | modified | Replace hardcoded indigo + shadow rgba |
| `src/components/dump/ExampleCard.jsx` | modified | Replace hardcoded indigo |
| `src/components/dump/DumpInput.jsx` | modified | Replace hardcoded indigo + shadow rgba (focus ring) |
| `src/components/auth/LoginModal.jsx` | modified | Replace hardcoded indigo |
| `src/components/layout/TopBar.jsx` | modified | Replace hardcoded indigo |
| `src/components/layout/BottomNav.jsx` | modified | Replace hardcoded indigo |
| `src/pages/Landing.jsx` | modified | Replace hardcoded indigo |
| `src/components/ui/Mascot.jsx` | modified | Add `className="mascot-img"` **only if** contrast fix is needed per §4.4 |

## 6. Acceptance

- [ ] `grep -r "5B3DF2\|4427D6\|rgba(91" src/` returns zero results.
- [ ] Light mode: primary button, active nav item, input focus ring, progress card gradient, logo "it" badge, and ambient blob-1 all show teal, not indigo.
- [ ] Dark mode: same surfaces show the adjusted teal (`#1B9DC6`); dark background (`#1B1A26`) unchanged.
- [ ] Mascot SVG outlines are legible against the dark card background (visual check).
- [ ] Coral, mint, yellow, and badge colors are unchanged (visual regression check).
- [ ] `npm run build` exits 0 with no new errors or warnings.
- [ ] No hex color values for brand (`#5B3DF2`, `#4427D6`) remain in any `src/` file.
- [ ] `tailwind.config.js` is untouched.

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| Shadow rgba context mismatched (button shadow applied to input) | Grep each file individually; match by the surrounding prop name (`boxShadow`, `box-shadow`, `focusShadow`) |
| TopBar drawer inline styles use HSL vars mixed with hardcoded hex — partial update breaks consistency | Read TopBar in full before editing; check all inline `style` props, not just those containing `5B3DF2` |
| Mascot SVG dark contrast fails but `filter: brightness()` is too aggressive (bleaches the mascot) | Test at 1.1, 1.15, 1.2 increments; `1.15` is a safe starting point |
| `AmbientBlobs` opacity values tuned for indigo may feel off at teal — teal is lighter at same saturation | Adjust opacity by ±0.02 if the blob reads too prominent; visual judgment during the manual pass |

## 8. Rollout

Single PR on `feat/58-brand-color-is-indigo-swap-to-teal-petro`. No feature flag — the
change is purely cosmetic and reverts cleanly by changing two CSS var values in
`src/index.css`. After merge:

1. Verify production at `dumpit.com.br` in both light and dark mode.
2. Close issue #58 automatically via `Closes #58` in the PR body.
3. Open a follow-up issue for badge token HSL migration (deferred in §3).

---

**Reviewer checklist:**

- Goals are achievable inside this PR.
- Non-goals are explicit; nothing snuck in.
- File list is complete.
- Acceptance criteria are objective.
