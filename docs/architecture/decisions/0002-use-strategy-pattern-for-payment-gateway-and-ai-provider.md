# ADR 0002 — Use Strategy Pattern for Payment Gateways and AI Providers

| Field  | Value      |
| ------ | ---------- |
| Status | Proposed   |
| Date   | 2026-06-17 |

## Context

DumpIt currently hardcodes two integration points that are likely to change over time:

- **Payment gateway:** the initial choice is a single provider, but the Brazilian market may require switching to or adding alternatives (e.g., Stripe, Mercado Pago, Pagar.me) for pricing, compliance, or regional coverage reasons.
- **AI provider:** Claude (Anthropic) is the current LLM behind task parsing and daily summaries. The dependency is concentrated in `functions/api/parse-tasks.js` and `functions/api/checkin-summary.js`. Switching models or providers — for cost, latency, or capability reasons — currently requires modifying the call site directly.

Both integrations share the same shape: a single async function receives a well-defined input and returns a well-defined output. Neither the rest of the system nor the caller should know which concrete implementation is active.

## Decision

We will adopt the **Strategy Pattern** for both integration points.

Each integration will be expressed as a common interface (a plain JS object or class with a fixed set of async methods), with concrete implementations living in their own modules. The active implementation is selected at startup via environment variable and injected into the functions that need it.

**Payment interface** (methods TBD when billing is specced, but likely `charge`, `refund`, `getStatus`). Concrete implementations: `StripeGateway`, `MercadoPagoGateway`.

**AI provider interface:** `parseTasksFromText(text): Task[]` and `summarizeDayFromTasks(tasks): string`. Concrete implementations: `ClaudeProvider` (current), potentially `OpenAIProvider` or others.

Neither interface is implemented now. This ADR records the pattern to adopt when each feature is first specced.

## Consequences

**Easier:**
- Swapping payment gateways or AI providers requires adding one file and changing one env var — no diff to business logic.
- Testing becomes straightforward: inject a stub implementation in any test or dev environment.
- New providers (e.g., a cheaper model for free-tier users) can be added without touching existing implementations.

**Harder:**
- A shared interface means the lowest common denominator wins. Provider-specific features (e.g., Claude's extended thinking, Stripe's subscription APIs) require extending the interface or bypassing it intentionally.
- The interface must be designed before the first implementation, which adds upfront effort when speccing billing or AI features.

**Different:**
- Implementations live in `functions/lib/providers/` (AI) and `functions/lib/gateways/` (payments), not inline in the handler functions.
- Each new integration needs: an interface definition, at least one concrete implementation, and a factory that reads the env var and returns the active instance.
