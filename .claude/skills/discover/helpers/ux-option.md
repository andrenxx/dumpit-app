# UX option block — template

Use this template once per option (A, B, C) when filling the
"UX options" section of a discovery body. Each option block is
~15–20 lines of markdown; the goal is enough fidelity for a human to
choose, not a working prototype.

The chosen option becomes the first commit of the implementation spec —
do not invest in TSX prototypes here.

---

```markdown
### Option <A | B | C>: <short name>

**Wireframe**

<ASCII sketch OR one-paragraph descriptive layout. Structure and
hierarchy only — no pixels, no colors. Show containers, headings,
primary action, supporting actions, key states.>

**Primitives**: <shadcn/ui primitives by name — `<Button>`, `<Dialog>`,
`<Card>`, `<Input>`, etc. Flag with `(new)` any primitive that does
not exist in `src/components/ui/` yet.>

**Copy**: <proposed strings, tagged with their tone-matrix context.
Example:
- CTA primário: "Processar áudio" *(confirmação simples)*
- Erro: "Use MP3 ou WAV. Esse arquivo é .ogg." *(erro de validação)*
- Estado vazio: "Comece enviando sua primeira pregação." *(estado vazio
  primeira vez)*>

**A11y**: <focus order, keyboard path, screen-reader narration, color
not the only signal. One line per concern. Reject the option here if
it depends on hover, color-only signaling, or unlabeled icons.>

**Mobile/PWA fit**: <viewport ≥ 360 px works? touch targets ≥ 44 px?
no hover-only? offline-degraded behavior if applicable? One line per
concern.>

**Evaluation axes**:
- Implementation cost: <S | M | L> — <one line>
- A11y impact: <one line>
- Reversibility: <one line>
- Alignment with existing flows: <one line>
- Mobile/PWA fit: <one line>
```

---

## Constraints every option must satisfy

If an option violates any of these, regenerate it before listing —
do not paper over with caveats.

- **Aurora design system** ([ADR 0005](../../../../docs/architecture/decisions/0005-ui-stack-tailwind-shadcn-aurora.md)):
  expressible in semantic tokens; no hex literals; no raw Tailwind
  colors.
- **Mobile-first**: viewport ≥ 360 px, touch targets ≥ 44 × 44 px,
  no hover-only affordances, no cursor-only interactions.
- **PWA-aware** ([ADR 0007](../../../../docs/architecture/decisions/0007-pwa-delivery-model.md)):
  no browser-native prompts the PWA shell blocks; flows degrade
  gracefully offline where applicable.
- **A11y ex-ante**: each option carries an a11y note covering keyboard
  path, focus, and screen-reader narration.
- **Voice and tone** ([`docs/ux/voice-and-tone.md`](../../../../docs/ux/voice-and-tone.md)):
  copy aligns with the voice principles and tone matrix; new contexts
  propose a row in the spec's §4.5 block.

## Convergence rule

If two options collapse to the same shape, regenerate rather than
padding to three. If the problem genuinely admits only two defensible
options, write the third slot as:

```markdown
### Option C: (no defensible third option)

<one paragraph explaining why a third was not produced — e.g., "the
choice is binary between modal and inline; a third pattern would be
contrived">
```
