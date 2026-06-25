# Spec 070 — Fix dev tooling sanity gates — 3 ESLint errors + lockfile

| Field  | Value                                                                    |
| ------ | ------------------------------------------------------------------------ |
| Issue  | [#46](https://github.com/andrenxx/dumpit/issues/46), [#51](https://github.com/andrenxx/dumpit/issues/51) |
| Branch | `chore/46-fix-dev-tooling-sanity-gates`                                  |
| Status | Draft — awaiting review                                                  |
| Type   | chore                                                                    |

## 1. Context

Two pre-existing tooling defects block every future spec in the workflow:

**ESLint gate is broken (#46).** `npm run lint` currently exits non-zero with 3 errors:
- `TopBar.jsx:21` — `no-unused-vars`: `navigate` is declared via `useNavigate()` but never referenced anywhere in the component.
- `LoginModal.jsx:208` — `react-hooks/set-state-in-effect`: `setActiveTab(...)` called synchronously inside a `useEffect` body. The pattern is intentional (resetting the active tab when the modal opens or its context prop changes) but the ESLint rule flags it.
- `Landing.jsx:38` — `react-hooks/set-state-in-effect`: `setShowLoginOnly(true)` called synchronously inside a `useEffect` body. The pattern is intentional (reading a localStorage flag after auth state resolves) and was added deliberately during the onboarding flow work.

The spec-driven workflow (CONTRIBUTING.md) requires `npm run lint` to exit 0 before any commit. With pre-existing errors the gate is either ignored (undermining it) or blocks every unrelated PR (breaking the workflow).

**Lockfile is gitignored (#51).** `.gitignore` explicitly excludes `package-lock.json`. Cloudflare Pages and any new contributor must run `npm install` — which resolves versions at install time — rather than `npm ci` against a pinned lockfile. Any indirect dependency can silently drift between installs, producing environment-specific bugs that are hard to reproduce.

## 2. Goals

- `npm run lint` exits 0 with 0 errors and 0 warnings.
- `package-lock.json` is committed and tracked; `.gitignore` no longer excludes it.
- No behavior change in any component — the ESLint fixes are minimal (remove dead code, or add scoped disable-comment where the pattern is intentional).

## 2.5 Validation strategy

Both gates are self-validating:
- `npm run lint` — exit code and output.
- `npm ci` in a clean environment with no `node_modules/` — exits 0 if and only if the lockfile is present and valid.

No fixtures, no UI flows, no mocks required.

## 3. Non-goals

- Fixing the underlying react-hooks anti-pattern in LoginModal or Landing — both `setState` calls are intentional and the minimal fix is a scoped disable comment with explanation.
- Switching the Cloudflare Pages dashboard build command from `npm install` to `npm ci` — that is a dashboard action outside this PR. Committing the lockfile is the necessary prerequisite; the dashboard change is a follow-up the team can do independently.
- Adding ESLint rules or stricter config — scope creep; addressed in a separate chore if needed.
- Fixing zero-test situation (#47) — separate spec.

## 4. Design

### 4.1 ESLint fix — remove dead `navigate` (TopBar.jsx)

`const navigate = useNavigate()` at line 21 was added during an earlier iteration of TopBar but the final implementation routes nothing programmatically. Remove the declaration and remove `useNavigate` from the react-router-dom import.

### 4.2 ESLint fix — scoped disable for intentional `setState` in effects

Both `LoginModal.jsx:208` and `Landing.jsx:38` call `setState` synchronously in an effect body. This is flagged by `react-hooks/set-state-in-effect` but is the correct pattern in both cases:

- **LoginModal**: the effect resets the active tab whenever the modal transitions from closed → open or when the `context` prop changes at open time. Without this reset, reopening the modal from a different context (e.g., first-dump → default) would leave the tab on whatever the user last selected.
- **Landing**: the effect reads a localStorage flag that TopBar sets synchronously before calling `signOut()`. The flag must be consumed in the same auth-state change cycle; an async callback would miss the window.

Fix: add `// eslint-disable-next-line react-hooks/set-state-in-effect` immediately above each `setState` call, with a one-line comment explaining why.

### 4.3 Lockfile — remove from .gitignore and commit

Remove the `package-lock.json` line from `.gitignore`. Run `npm install` to ensure the lockfile is current and commit it. The lockfile will be tracked going forward; PRs that change `package.json` must also update and commit the lockfile.

## 4.5 UX decision

N/A — discovery marked ux: not-applicable.

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `src/components/layout/TopBar.jsx` | Modify | Remove `useNavigate` import and unused `navigate` declaration |
| `src/components/auth/LoginModal.jsx` | Modify | Add scoped ESLint disable comment above `setActiveTab` in useEffect |
| `src/pages/Landing.jsx` | Modify | Add scoped ESLint disable comment above `setShowLoginOnly` in useEffect |
| `.gitignore` | Modify | Remove `package-lock.json` line |
| `package-lock.json` | Create | Commit current lockfile |

## 6. Acceptance

- [ ] `npm run lint` exits 0 with no errors or warnings.
- [ ] `TopBar.jsx` no longer imports or declares `navigate`.
- [ ] `LoginModal.jsx` and `Landing.jsx` retain existing behavior — the `setState` calls are unchanged; only the disable comment is added.
- [ ] `package-lock.json` is present in the repo root and tracked by git (not listed in `.gitignore`).
- [ ] `npm ci` succeeds in a clean environment (no `node_modules/`).

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| Committing the lockfile adds a large binary-like file to git history permanently | Accepted — lockfiles are expected in JS projects and normal to track; the file is text and diffs cleanly |
| Scoped `eslint-disable` comments could mask future real issues at those lines | Comments name the exact rule and include a one-line rationale; a reviewer can evaluate them individually |
| Removing `navigate` from TopBar breaks a feature if it was used somewhere not visible in the lint output | `no-unused-vars` is definitive — if the variable were referenced, the error would not exist |

## 8. Rollout

Single PR, two commits:
1. `chore(#46): fix 3 ESLint errors — remove unused navigate, add scoped disable comments`
2. `chore(#51): remove package-lock.json from .gitignore and commit lockfile`

After merge: optionally update the Cloudflare Pages dashboard build command to `npm ci` (not required for CI correctness since Pages will use the committed lockfile with `npm install` too, but `npm ci` is stricter and preferred).

---

**Reviewer checklist:**

- Goals are achievable inside this PR.
- Non-goals are explicit; nothing snuck in.
- File list is complete.
- Acceptance criteria are objective.
