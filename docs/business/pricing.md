# Pricing

> Last updated: 2026-06-18

How DumpIt makes money, what the plans look like, and why they are
shaped this way. Pair with [`personas.md`](personas.md) to understand
who is paying and [`vision.md`](vision.md) for the principle that the
free tier must be genuinely valuable.

## Strategy

- **Freemium with a permanent free tier.** The free tier is not a
  time-limited trial — it is a real, functional product forever.
  This builds trust and retention.
- **One AI call vitalício (lifetime) on the free plan.** Not daily,
  not weekly — one call, ever. This is deliberate: enough to
  demonstrate the value, not enough to substitute the paid plan.
- **Paid plan unlocks unlimited AI.** A single binary gate: either
  you pay, or you use the Kanban manually. No per-call billing, no
  credit packs in V1.

## Plans

| Plan | Price (BRL/mês) | What it includes |
| ---- | --------------- | ---------------- |
| **Free** | R$ 0 | Unlimited manual Kanban (forever) + **1 AI call lifetime** (parse a dump once to see the value) |
| **Paid** | R$ 25/mês | Everything in free + **unlimited AI parsing** + **daily AI check-in summaries** |

## The freemium gate logic

The gate is implemented in `functions/api/parse-tasks.js`:

- Free plan: checks `ai_usage` table for any row for this user. If
  `count >= 1`, returns `402 upgrade_required`.
- Paid plan: allows up to 20 AI calls per day (tracked per
  `user_id + date` in `ai_usage`). Returns `402` when the daily cap
  is reached.

The daily cap for paid users (20/day) is a soft guard against abuse,
not a product differentiator. It is set high enough that normal usage
never hits it.

## Rationale

**Why a permanent free tier (not a time trial)?**

Time trials convert impatient early adopters but churn everyone else
at day 8. A permanent free tier means the user never has to "decide
by Sunday" — the decision is pulled, not pushed. When the user's
workload grows or a paid-plan friend demonstrates the AI flow, the
conversion is organic rather than pressured.

The cost of a free Kanban user is near-zero (no AI calls, Supabase
RLS keeps their data scoped, Cloudflare Pages is flat-rate). The
lifetime AI call does cost something but pays for itself in conversion
rate: the user experiences the product's core differentiator before
deciding.

**Why R$25/mês?**

- Below the "coffee shop lunch" psychological threshold for a
  working professional in a major Brazilian city.
- Above the "impulse buy, cancel next month" threshold — the
  product needs to be worth it.
- Single plan avoids anchor-effect complexity for V1. If retention
  data shows users want a lighter paid tier (e.g., 5 AI calls/day
  at R$12), that is a V2 decision.

**Why unlimited AI on paid (not a credit system)?**

Credit systems shift the user's attention from "getting work done"
to "managing my credits." Every credit-system interaction is friction.
For a product whose differentiator is zero-friction task entry, credit
anxiety is a direct contradiction of the value proposition. Unlimited
AI is cleaner — the user never has to think about it.

The daily cap (20/day for paid) is the abuse guard, not the UX. A
normal user who dumps tasks once or twice a day will never see it.

## Open questions

- **Annual pricing.** Not in V1. A yearly discount (e.g., R$200/ano,
  roughly 2 months free) is plausible once retention data exists.
- **Stripe integration.** Payment processing is not yet implemented
  (see issue #43). The paid plan infrastructure (user.plan column in
  Supabase) is in place; the checkout flow is not.
- **Team pricing.** Out of scope for V1. See [`personas.md`](personas.md).
