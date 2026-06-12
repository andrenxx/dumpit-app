# `/discovery-review` — example transcripts

## Example 1 — clean pass, label applied

```
User: /discovery-review 85

Skill: [load-discovery.sh writes the issue body + labels to a tmp file]
       [spawns Explore subagent with discovery, checklist, docs/business/*]

       ✅ Pass
       - 0. Type label — `type:chore` (one label, valid).
       - 1. Problem statement is concrete — body opens with the
         spec 038 trigger and names two specific gaps (UX trust,
         product alignment).
       - 2. Why now — quotes spec 038 as the load-bearing event and
         issue #67 as the docs/business/ landing.
       - 3. Validation signal — names "discovery flagged before /spec
         promotes it" with a label as the observable.
       - 4. UX cross-check — `ux: not-applicable` and the body has
         no UI signals (it is a harness skill); consistent.
       - 5. Vision alignment — N/A — non-functional (`type:chore`).
       - 6. Persona alignment — N/A — non-functional (`type:chore`).
       - 7. Pricing alignment — N/A — non-functional (`type:chore`).
       - 8. Competitor positioning — N/A — non-functional (`type:chore`).
       - 9. Recommended next step — "Open feature spec via /spec"
         is consistent with items 1-4 passing.

       ❌ Blockers
       (none)

       All checks passed. Apply phase:discovery-reviewed label?
       [AskUserQuestion, default yes]

User: yes

Skill: [runs apply-discovery-reviewed.sh 85 "10/10 pass (4 N/A — non-functional), 0 blockers"]

       phase:discovery-reviewed applied to issue #85: https://github.com/aurora-crista/pregacao-dev/issues/85
       Next step: run /spec 85 to convert this discovery into a feature spec.
```

## Example 2 — UX misclassification, blocker stops promotion

```
User: /discovery-review 71

Skill: ✅ Pass
       - 1. Problem statement is concrete — body opens with two real
         examples ("dashboard upload state", "primary button colors").
       - 2. Why now — names compounding cost as the trigger.
       - 3. Validation signal — observable: "code-review catches
         component-shape inventions before /ship".
       - 5. Vision alignment — guardrails reinforce vision.md.
       - 6. Persona alignment — contributor persona.
       - 7. Pricing alignment — internal, no impact.
       - 8. Competitor positioning — no parity claim.
       - 9. Recommended next step — open spec.

       ❌ Blockers
       - 4. UX cross-check — body says "dashboard", "components",
         "primary button colors" but the issue carries
         `ux: not-applicable`. Mismatch — set `ux: required` and
         re-run, or remove the UI signals from the body.

       Address blockers, then run /discovery-review 71 again.
       [No label prompt; no comment posted.]
```

## Example 3 — vision drift on a product-facing discovery, blocker

```
Skill: [discovery is type:feature]

       ✅ Pass: 8 items

       ❌ Blockers
       - 5. Vision alignment — discovery proposes a podcast
         analytics dashboard. docs/business/vision.md says the
         product mission is "asynchronous audio processing for
         pregação openings/closings", not analytics. Edit
         docs/business/vision.md first if this is a deliberate pivot,
         then re-run /discovery-review.

       Address blockers, then run /discovery-review <N> again.
```

Note: items 5–8 only run for `type:feature` and `type:bug`
discoveries. The same body labelled `type:chore` would skip
vision/personas/pricing/competitors entirely.
