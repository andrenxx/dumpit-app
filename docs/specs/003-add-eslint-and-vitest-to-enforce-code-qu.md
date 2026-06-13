# Spec 003 — Add ESLint and Vitest to Enforce Code Quality Gates

| Field  | Value                                                                              |
| ------ | ---------------------------------------------------------------------------------- |
| Issue  | [#3](https://github.com/andrenxx/dumpit/issues/3)                                  |
| Branch | `chore/3-add-eslint-and-vitest-to-enforce-code-qu`                                 |
| Status | Draft — awaiting review                                                            |
| Type   | chore                                                                              |

## 1. Context

`package.json` currently declares only `dev`, `build`, and `preview` scripts.
CLAUDE.md mandates that `lint` and `test` be present so `/implement`'s sanity
gates can run them on every JS/JSX diff. The absence was flagged as a concern in
the code review for PR #2 (spec 001) and deferred to this follow-up chore.

Without these gates, a future PR could introduce rule violations or regressions
that would only surface in production.

## 2. Goals

- `npm run lint` runs ESLint over `src/**/*.{js,jsx}` and exits 0 on the current
  codebase.
- `npm run test` runs Vitest and exits 0 (no test files yet — pass-by-default is
  acceptable).
- Both scripts are declared in `package.json`.
- ESLint config covers React + JSX with the recommended rule set (no custom
  strictness beyond defaults).

## 2.5 Validation strategy

Run `npm run lint` and `npm run test` locally after implementation. Both must
exit 0 with no errors. Confirm that ESLint picks up `eslint.config.js` and that
Vitest is wired through `vite.config.js`.

## 3. Non-goals

- Writing application tests (belongs to each feature spec).
- Stricter rules beyond the ESLint recommended + React plugin defaults.
- Pre-commit hooks (Husky / lint-staged) — separate chore if needed.
- TypeScript migration.
- Fixing any lint errors introduced by future code (each PR owns its own
  gate compliance).

## 4. Design

### 4.1 ESLint (flat config)

Use ESLint 9's flat config (`eslint.config.js`). Install:

```
eslint
@eslint/js
eslint-plugin-react
eslint-plugin-react-hooks
globals
```

`eslint.config.js`:

```js
import js from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: { react: reactPlugin, 'react-hooks': reactHooks },
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
    settings: { react: { version: '18' } },
  },
]
```

> **Implementation note:** `version: 'detect'` was replaced with `'18'` because
> `eslint-plugin-react` 7.x + ESLint 10 flat config breaks the detection API
> (`contextOrFilename.getFilename is not a function`).

`lint` script: `"lint": "eslint src"`.

### 4.2 Vitest

Vitest reuses the Vite config, so no extra bundler setup. Install:

```
vitest
@vitest/ui  (optional, omit for minimal install)
```

Add to `vite.config.js`:

```js
/// <reference types="vitest" />
```

And a `test` field:

```js
test: {
  environment: 'jsdom',
  passWithNoTests: true,
}
```

> **Implementation note:** `passWithNoTests: true` is required because Vitest
> exits with code 1 when no test files are found (the default), which would
> break the sanity gate before any tests exist.

Install `jsdom` as a dev dependency for the DOM environment.

`test` script: `"test": "vitest run"`.

(`vitest run` is the non-watch mode used in CI and sanity gates; `vitest` alone
is watch mode for local dev.)

### 4.3 `package.json` scripts after

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint src",
  "test": "vitest run"
}
```

## 4.5 UX decision

N/A — no UX surface introduced.

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `package.json` | modify | add lint + test scripts; add dev deps |
| `eslint.config.js` | create | flat config for ESLint 9 |
| `vite.config.js` | modify | add `test` block for Vitest + jsdom |

## 6. Acceptance

- [ ] `npm run lint` exits 0 on the current codebase with no errors.
- [ ] `npm run test` exits 0 (no test files = pass-by-default).
- [ ] `package.json` declares both `lint` and `test` scripts.
- [ ] `eslint.config.js` exists at repo root.
- [ ] `vite.config.js` includes a `test` block pointing to jsdom.

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| ESLint flags existing code | Run lint before committing; fix any violations in the same PR |
| Vitest jsdom conflicts with Vite 5 | jsdom is well-tested with Vite 5; pin versions if conflict arises |

## 8. Rollout

Single PR, single commit:
`chore(#3): add eslint and vitest gates`

No follow-up issues needed unless lint reveals violations that need a separate
fix PR.

---

**Reviewer checklist:**

- Goals are achievable inside this PR.
- Non-goals are explicit; nothing snuck in.
- File list is complete.
- Acceptance criteria are objective.
