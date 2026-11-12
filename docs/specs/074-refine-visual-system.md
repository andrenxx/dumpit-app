# Spec 074 — Refine visual system: typography, color and surface effects

| Field    | Value                                                                 |
| -------- | --------------------------------------------------------------------- |
| Issue    | [#74](https://github.com/andrenxx/dumpit-app/issues/74)               |
| Branch   | `chore/74-refine-visual-system`                                       |
| Status   | Draft — awaiting review                                               |
| Type     | chore                                                                 |

## 1. Context

The UI reads as generic AI-generated design. Evidence from the Impeccable design detector on the rendered landing page (`http://localhost:5173/`): primary button text at 3.7:1 contrast (AA needs 4.5:1), a colored dark-mode glow shadow, and a cyan gradient palette flagged as an AI tell. Code inspection adds:

- Typography is the system font only (`src/index.css`), with no role scale. Text as small as 9.5px is used (`LoginModal.jsx`, `Badge.jsx`, `KanbanColumn.jsx`, `TaskCard.jsx`, `TopBar.jsx`, `ProgressCard.jsx`, `TasksPage.jsx`).
- Each Kanban column header has its own gradient (cyan, purple, green) via `--col-*-grad`.
- Three blurred color blobs sit behind every screen (`AmbientBlobs.jsx`).
- Glassmorphism (`.glass-surface*`, `backdrop-filter`) is applied to the top bar, bottom nav, drawer, modals, cards and the dump input.
- Colored shadows (`--shadow-brand-*`, `glass-*` Tailwind shadows) and gradient fills on buttons, the progress card, the avatar and the nav pill.
- Colors hardcoded inline (`#FF6F52`, `#D93B22`, `#e53e3e`, `#ACA4C8`) next to token usage, and neutral tokens tinted violet (hue 252–270) against a teal brand.

The product record (`PRODUCT.md`) classifies this as an Operate-mode surface: a work tool where the interface should recede behind the task. Brand commitments to preserve: the name, the penguin mascot, the informal pt-BR voice, and the teal accent (`#0E7C9E`).

## 2. Goals

- One self-hosted typeface with a fixed role scale; no rendered text below 12px.
- Teal as the single accent; neutrals tinted toward the brand hue; semantic colors only for status and priority.
- No gradient fills, ambient blobs, backdrop blur, or colored glow shadows anywhere in `src/`.
- AA contrast (4.5:1 text, 3:1 controls) for primary action, body, secondary and metadata text in both light and dark themes.
- Identical behavior and copy: this is a visual refactor only.

## 2.5 Validation strategy

The oracle is a mix of mechanical scans and a rendered check; the repo has no UI test harness, and adding one is out of scope.

- **Detector:** `impeccable detect src/` and `impeccable detect http://localhost:5173/`, before and after. The three landing findings must disappear and no new finding may appear on screens reachable without authentication.
- **Computed styles:** a script run in the browser pane reads computed `font-size`, `font-family` and color/background pairs on landing, dump, and login modal in both themes: no `font-size` under 12px, font family resolves to the bundled face, contrast pairs meet AA.
- **Network:** the page makes no request to a third-party font host.
- **Repo gates:** `npm run lint`, `npm test`, `npm run build` exit 0.
- **Behavior:** manual pass over the dump flow, login modal tabs, task create/edit, and Kanban drag and drop. Kanban needs a signed-in session, so it is verified against a local Supabase project or locally seeded data; if neither is available, that screen is verified by code review only and the PR says so.

## 3. Non-goals

- Desktop layout and the `maxWidth: 480` shell (separate issue).
- Routing and navigation structure; the bottom nav stays a bottom nav.
- Motion and animation changes beyond removing `backdrop-filter`/blur transitions.
- Accessibility hardening (aria labels, focus management, error and empty states).
- Changes to copy, the mascot, features, or the freemium gate. `FreemiumBanner.jsx` only loses its gradient.
- A full design-system extraction or `DESIGN.md` (a later `document` step).

## 4. Design

### 4.1 Typography

- Add `@fontsource-variable/instrument-sans` (OFL-1.1, variable `wght` axis) and import its latin `wght` stylesheet in `src/main.jsx`. Self-hosted: no request to a font CDN. `font-display: swap` is the package default.
- `body` font stack: `'Instrument Sans Variable', system-ui, -apple-system, 'Segoe UI', sans-serif`, mirrored in Tailwind `fontFamily.sans`.
- Role scale defined once as CSS custom properties in `src/index.css` and mapped into `tailwind.config.js` `fontSize`:

| Role    | Size                | Weight | Used for                                       |
| ------- | ------------------- | ------ | ---------------------------------------------- |
| display | 2.25rem (36px)      | 600    | Welcome headline                               |
| title   | 1.25rem (20px)      | 600    | Page and modal titles                          |
| body    | 1rem (16px)         | 400    | Dump input, task title, form fields            |
| label   | 0.875rem (14px)     | 500    | Buttons, nav, form labels, column names        |
| meta    | 0.75rem (12px)      | 500    | Counts, badges, hints, legal text              |

- Headings get `text-wrap: balance`; multi-line body copy gets `text-wrap: pretty`.
- Every inline `fontSize` below 12 is replaced by the nearest role; sizes 12–17 map to `meta`/`label`/`body`/`title`.

### 4.2 Color

- Define the action color once: `--action` = `#0E7C9E` in both themes (white text on it is 4.8:1) with `--action-hover` one step darker. All primary buttons, the nav pill, the avatar and the progress fill use the solid `--action`. In dark mode the lighter `--brand` (`#1B9DC6`) is used only for text and icons on dark surfaces, never as a fill under white text (3.1:1).
- Neutrals: replace the violet-tinted `--bg-app`, `--text-*`, `--border-*` values (hue 252–270) with a low-chroma ramp at the brand hue (~200). Dark theme gets explicit surface steps (page, raised, overlay) rather than white alpha overlays.
- Remove the blobs: delete `AmbientBlobs.jsx` and its usages in `App.jsx` and `Landing.jsx`; the page background is a flat token.
- Kanban column headers lose their gradient fill. Each header becomes a neutral row: label in `label` role, count in `meta`, and an 8px status dot (`a_fazer` neutral, `fazendo` teal, `feito` green). The purple hue is dropped. Status is also carried by the text label, not color alone.
- Priority badges keep their three semantic hues, with text colors checked to 4.5:1 on their backgrounds in both themes.
- Hardcoded hex values in components move to tokens: `--danger` (replaces `#D93B22`, `#e53e3e`), `--text-hint`/`--text-secondary` (replaces `#ACA4C8`, `#aaa`).

### 4.3 Surfaces and effects

- Remove `.glass-surface`, `.glass-surface-strong`, `.glass-inset-highlight` and every `backdrop-filter`/`WebkitBackdropFilter`. Replace with two classes: `.surface` (solid background token, 1px border) and `.surface-raised` (same plus a neutral two-layer shadow, e.g. `0 1px 2px` and `0 4px 12px` at `hsl(200 30% 10% / 0.08)`).
- Remove `--shadow-brand-*` variables and the Tailwind `glass-*` shadows. Remaining shadows are neutral with a vertical offset.
- Modal and drawer scrims become a flat translucent neutral; no blur.
- `LoadingOverlay` and `FreemiumBanner` swap gradients for solid tokens. The mascot and its animation are untouched.

### 4.4 Alternatives considered

- **Keep the system font stack and only add a scale:** zero assets, but the product keeps no typographic identity; rejected as the weaker fix for the "generic" complaint.
- **Load the font from Google Fonts:** simpler, but adds a third-party request and a runtime dependency; rejected in favor of self-hosting.
- **Desaturate the existing gradients instead of removing them:** keeps the look but not the detector findings or the Operate-mode restraint; rejected.

Confidence on the face is moderate: Instrument Sans is chosen on character and pt-BR coverage and is validated by the detector's `overused-font` rule. It can be swapped by changing one import and one token.

## 4.5 UX decision

N/A — fresh issue with no discovery; visual refinement only, no flow or copy changes.

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `package.json`, `package-lock.json` | Modify | Add `@fontsource-variable/instrument-sans`. |
| `src/index.css` | Modify | Tokens (neutrals, action, status, danger), type scale, `.surface*`, remove glass classes and brand shadows. |
| `tailwind.config.js` | Modify | `fontFamily`, `fontSize` roles, remove glass shadows, new color tokens. |
| `src/main.jsx` | Modify | Import the font stylesheet. |
| `src/App.jsx`, `src/pages/Landing.jsx` | Modify | Remove `AmbientBlobs`; flat background. |
| `src/components/layout/AmbientBlobs.jsx` | Delete | |
| `src/components/layout/TopBar.jsx`, `BottomNav.jsx` | Modify | Surfaces, solid avatar and nav pill, type roles, scrim without blur. |
| `src/components/tasks/KanbanColumn.jsx`, `TaskCard.jsx`, `NewTaskButton.jsx`, `ProgressCard.jsx`, `TaskModal.jsx` | Modify | Neutral headers with status dot, surfaces, type roles, solid fills. |
| `src/pages/TasksPage.jsx`, `src/pages/WelcomePage.jsx`, `src/pages/DumpPage.jsx` | Modify | Type roles, solid button. |
| `src/components/dump/DumpInput.jsx` | Modify | Surface, solid submit button, no glow focus shadow. |
| `src/components/auth/LoginModal.jsx` | Modify | Type roles (no 9.5–11px), tokens instead of hex, no blur. |
| `src/components/ui/dialog.jsx`, `sonner.jsx`, `button.jsx`, `Badge.jsx`, `shadcn-badge.jsx`, `LoadingOverlay.jsx`, `FreemiumBanner.jsx` | Modify | Tokens, type roles, no gradients or shadows. |
| `PRODUCT.md` | Add | Product record captured by Impeccable `init`; referenced by this work. |

## 6. Acceptance

- [ ] `impeccable detect http://localhost:5173/` reports no findings on the landing page.
- [ ] `impeccable detect src/` reports no findings.
- [ ] No `linear-gradient`, `radial-gradient`, `backdrop-filter`, blur filter, or colored `box-shadow`/`text-shadow` remains in `src/` (checked by grep).
- [ ] `AmbientBlobs.jsx` is deleted and unreferenced.
- [ ] Computed `font-size` of rendered text is at least 12px on landing, dump, and login modal; `font-family` resolves to Instrument Sans Variable.
- [ ] Primary button, body, secondary and metadata text meet 4.5:1 in light and dark themes (computed values recorded in the PR).
- [ ] No network request to a third-party font host.
- [ ] `npm run lint`, `npm test`, and `npm run build` exit 0.
- [ ] Dump flow, login modal, task create/edit and drag and drop behave as before; screens that could not be exercised are named in the PR.

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| Dark-theme contrast regressions from replacing alpha overlays with solid steps. | Define explicit dark surface tokens; compute contrast for each pair in both themes before merge. |
| Kanban cannot be rendered without authentication, so it may ship less verified. | Verify with local seeded data when possible; otherwise state it in the PR and rely on token-level checks. |
| Inline styles spread across components make a miss likely. | Grep-based acceptance for gradients, blur, shadows, hex values and small sizes; detector scan on the rendered page. |
| Font adds weight and a swap flash. | Latin subset variable file only; `font-display: swap`; system fallback with similar metrics. |
| Visual taste: the result may feel too plain. | This pass is the quiet baseline; character is added in follow-up steps (`polish`, `animate`) with the same detector gate. |

## 8. Rollout

Single PR, implemented in four chunks: (1) tokens, type scale and font; (2) shell and layout components; (3) tasks components; (4) dump, welcome, auth, and shared UI. Each chunk passes the repo gates before commit. No feature flag. After merge, follow-up issues: desktop layout and routing, accessibility hardening (`harden`), motion, and `document` to generate `DESIGN.md`. Installing the Impeccable skill files into the repo is a separate decision and is not part of this PR.

---

**Reviewer checklist:**

- Goals are achievable inside this PR.
- Non-goals are explicit; nothing snuck in.
- File list is complete.
- Acceptance criteria are objective.
