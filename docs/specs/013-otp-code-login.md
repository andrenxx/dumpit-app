# Spec 013 — OTP Code Login

| Field    | Value                                                           |
| -------- | --------------------------------------------------------------- |
| Issue    | [#13](https://github.com/andrenxx/dumpit/issues/13)             |
| Branch   | `feat/13-otp-code-login`                                        |
| Status   | Draft — awaiting review                                         |
| Type     | feature                                                         |

## 1. Context

The current login flow sends a magic link via email. On mobile, clicking the link opens a new browser tab, which resets the app session — the user lands on `/dashboard` in a new tab while the original tab stays logged out. This is a known Supabase magic-link UX pitfall on mobile.

Supabase already includes a 6-digit OTP code in the same email as the magic link (`signInWithOtp` behaviour). No backend or Supabase configuration change is needed — only the frontend modal needs to be updated to expose the code input step.

## 2. Goals

- After submitting their email, the user sees a 6-digit code input in the same modal tab.
- Entering the correct code authenticates the user in-place without leaving or reloading the tab.
- Invalid or expired code shows a PT-BR error message.
- A "Reenviar código" link lets the user request a new code without closing the modal.

## 2.5 Validation strategy

Manual flow in the running app (`npm run preview:fullstack` at port 8788):
1. Open the login modal, submit an email.
2. Check the inbox — the email must contain a 6-digit code.
3. Enter the code → modal closes, user is on the dashboard authenticated.
4. Enter a wrong code → error message appears in PT-BR.
5. Click "Reenviar código" → new email is sent, code input clears and accepts the new code.

No automated test is added for this flow because it requires a live Supabase session; testing at the boundary (`verifyOtp` return values) is covered by the existing vitest suite scope.

## 3. Non-goals

- Phone/SMS authentication.
- Social login (Google, GitHub, etc.).
- Removing the magic link from the email (it stays as a fallback).
- Any change to the backend (`functions/`) or Supabase Auth configuration.
- Persisting the email across page refreshes.

## 4. Design

### 4.1 Modal states

The modal has three states (replaces the current two):

| State | What the user sees |
|---|---|
| `email` | Email input + "Entrar" button (current behaviour) |
| `code` | 6-digit code input + "Verificar" button + "Reenviar código" link |
| `error` | Inline error below code input; input stays visible so user can retry |

Transition: `email` → send OTP → `code`. Successful verify → modal closes via `onClose()`. Failed verify → `error` (stays in `code` state).

### 4.2 useAuth changes

Add `verifyOtp(email, token)` to `useAuth.js`:

```js
const verifyOtp = async (email, token) => {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
  if (error) console.error('verifyOtp:', error)
  return { error }
}
```

Return it from `useAuth` alongside `signInWithEmail`.

### 4.3 LoginModal changes

- State: add `code` string, `step` ('email' | 'code'), `codeError` string.
- On successful `signInWithEmail`: set `step = 'code'`.
- Code input: `<input type="text" inputMode="numeric" maxLength={6} pattern="\d{6}" />`.
- On "Verificar" submit: call `verifyOtp(email, code)`; on success call `onClose()`; on error set `codeError`.
- "Reenviar código": calls `signInWithEmail(email)` again, clears `code` and `codeError`.
- Remove the `sent` boolean state (replaced by `step`).

### 4.4 Copy (PT-BR)

| Context | Copy |
|---|---|
| Step title | `Digite o código` |
| Subtitle | `Enviamos um código de 6 dígitos para <email>` |
| Input placeholder | `000000` |
| Submit button | `Verificar` |
| Resend link | `Reenviar código` |
| Invalid code error | `Código inválido ou expirado. Tente novamente.` |

## 4.5 UX decision

N/A — no discovery was opened for this feature; the approach is unambiguous given the Supabase OTP primitive already in use.

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `src/hooks/useAuth.js` | modify | Add `verifyOtp` function |
| `src/components/auth/LoginModal.jsx` | modify | Add `code` step with input and resend |

## 6. Acceptance

- [ ] Submitting email transitions modal to code input step without closing or reloading.
- [ ] Entering the correct 6-digit OTP closes the modal and leaves the user authenticated on `/dashboard`.
- [ ] Entering a wrong code shows "Código inválido ou expirado. Tente novamente." inline.
- [ ] "Reenviar código" sends a new OTP email and clears the code input.
- [ ] `lint` and `build` gates pass.

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| Supabase OTP token expires in 1 hour by default | "Reenviar código" mitigates; expiry message is generic enough to cover both cases |
| User enters magic link on a different device — OTP code session may already be consumed | Magic link still works as fallback; not in scope to fix |

## 8. Rollout

Single PR. No flag needed — the change is entirely in the login modal, which is only shown to unauthenticated users. Magic link continues to work as a fallback in the same email.

---

**Reviewer checklist:**

- Goals are achievable inside this PR.
- Non-goals are explicit; nothing snuck in.
- File list is complete.
- Acceptance criteria are objective.
