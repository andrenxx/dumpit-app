# Competitive landscape

> Last updated: 2026-06-18

Who else operates in the task management space, and where DumpIt sits.
Pair with [`vision.md`](vision.md) for product framing and
[`personas.md`](personas.md) for who DumpIt is built for.

This document is a **snapshot**. Refresh when starting work on
related discoveries (positioning, marketing copy, feature
prioritization).

## International (dominant generic players)

The task management category is crowded globally with well-funded
products.

| Player | Positioning | Why they don't win our user |
| ------ | ----------- | --------------------------- |
| [Todoist](https://todoist.com/) | Clean, cross-platform, highly capable | English-first, configuration-heavy, the free tier is frustrating |
| [Microsoft To Do](https://todo.microsoft.com/) | Free, Microsoft ecosystem | UI is generic, no intelligence, requires Microsoft account |
| [Notion](https://www.notion.so/) | Everything bucket, extreme flexibility | Setup cost is prohibitive; most users bounce before shipping a task |
| [Asana](https://asana.com/) | Team projects and workflows | Overkill for personal tasks; priced and designed for teams |
| [Things 3](https://culturedcode.com/things/) | Premium personal task manager (Apple only) | Apple-only, paid upfront, English |

**Common shape:** these products assume the user knows what their
tasks are and needs a place to put them. None of them solve the
"I don't know where to start" or "I have a pile, not a list" problem.

## Brazil

| Player | Positioning | Notes |
| ------ | ----------- | ----- |
| [Taskade](https://www.taskade.com/) | AI-powered workspace, PT-BR available | More collaboration/notes than tasks; AI is a bolt-on |
| [Trello (Portuguese)](https://trello.com/) | Visual Kanban | Widely used in Brazil by small businesses; no AI; team-first |
| Microsoft To Do (Portuguese) | Free list manager | Common but unsatisfying; users default to WhatsApp |
| WhatsApp to self | Informal reminder system | The dominant "task manager" in Brazil; voice note to self is universal |

**The real competitor is WhatsApp.** Brazilians don't abandon task
managers for another task manager — they abandon them for a voice
note to themselves. Any product that requires more setup than typing
a voice note loses to WhatsApp by default.

## AI task managers (emerging category)

| Player | Positioning | Why they don't win our user |
| ------ | ----------- | --------------------------- |
| [Goblin.tools](https://goblin.tools/) | AI that breaks tasks into steps | English-only, single-task focus, no persistent workspace |
| [Motion](https://www.usemotion.com/) | AI that schedules and reprioritizes | US-focused, USD pricing, calendar-heavy, expensive |
| [Reclaim AI](https://reclaim.ai/) | Time blocking + task scheduling | Calendar-first, English, USD pricing |

**Common shape:** the emerging AI task manager category is
calendar-centric (scheduling) and English-first. None target the
"overwhelmed Brazilian with a pile of things" use case.

## Gap and positioning

**The gap.** A PT-BR, AI-native personal task manager that:

1. Accepts natural language input as the primary entry mode — not a
   form, not a template.
2. Handles Portuguese natively — not as a localization layer over
   English defaults.
3. Provides a permanent free tier that is genuinely useful — not a
   crippled trial designed to push conversion.
4. Prices below R$30/mês — below the threshold where cost becomes
   the reason to cancel.

**DumpIt's position.** DumpIt fills this gap for the Brazilian market.
Defensibility comes from:

- **Language model calibration for PT-BR.** The AI prompt, priority
  inference rules, and task extraction are calibrated on how
  Brazilians write about work and stress — not a direct translation
  of English heuristics.
- **Zero-config onboarding.** No tutorial, no template selection, no
  workspace name. The user writes; the product works. This bar is
  higher than it sounds — every competitor fails it.
- **Trust via the free tier.** The free Kanban is unlimited and
  permanent. The user never needs to enter payment details to find
  out if the product is useful. This is a deliberate trust
  investment; the AI call is the conversion event.
- **Framing around relief, not productivity.** The copy and product
  surface say "dump it" — a release, not an optimization. This
  resonates with the persona who is overwhelmed, not the persona who
  is optimizing.

**What we are not trying to defeat.** We are not trying to displace
Todoist or Notion for power users. We are not trying to compete with
Microsoft To Do on breadth. The wedge is specifically: Brazilian
individual with an unstructured pile of tasks + AI that organizes it
+ pricing that doesn't require a decision.
