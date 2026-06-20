# Vision

> Last updated: 2026-06-18

What DumpIt is, why it exists, and the principles that shape how we
build it. Pair with [`personas.md`](personas.md) for the customer view
and [`pricing.md`](pricing.md) for the commercial model.

## Problem

Most Brazilians who need to manage their daily tasks face a
productivity tool market built for a different profile: English-first,
template-heavy, configuration-required. The tools that do exist in
Portuguese are direct translations of international products — the
friction remains, just in a different language.

Beyond the localization gap, the fundamental problem with task managers
is the **input cost**. Every to-do app assumes the user already knows
what their tasks are, properly named, properly categorized, properly
prioritized. Real life doesn't work that way. A person knows they have
a stressful pile of things to do; they rarely know how to break that
pile into structured, actionable items.

The result: people abandon task managers within days of signing up,
returning to scattered notes, WhatsApp reminders to self, and mental
overhead.

## Mission

> Dump it, we organize it.

DumpIt exists to eliminate the friction between having things to do and
having a system that holds them. The user doesn't need to organize —
they need to express. The AI does the organizing.

## Value proposition

> Write everything you need to do, in any order, in Portuguese, as if
> you were talking to a friend. DumpIt turns it into a Kanban board,
> with priorities, organized and ready to work.

The shortest path between "I have a lot to do" and "I know what to do
next."

## Principles

- **Zero configuration.** The product works on the first interaction,
  with no tutorials, templates, or setup screens. The user writes a
  sentence; DumpIt works. This shapes every product decision: if a
  feature requires configuration, it does not ship.
- **Portuguese first, natively.** Not a translation layer — the
  product's language model, copy, flow, and defaults are calibrated
  for Brazilian users. How Brazilians talk about work, stress, and
  deadlines is the product's native grammar.
- **Manual Kanban is free forever.** The free tier is a permanent,
  fully functional task manager — not a crippled trial. This is
  deliberate: the Kanban retains the user; the AI converts them. The
  split is the business model, not a temporary promotion.
- **AI is the upsell, not the product.** The core value is the system
  — a place where your tasks live and you can see them. The AI
  accelerates entry. This ordering matters for trust: the product
  doesn't become worthless without AI.
- **Incremental delivery.** Ship the smallest valuable thing, validate
  with real users, iterate. The first user is the product owner
  themselves.

## Product non-goals

What DumpIt is **not**:

- **Not a project management tool.** DumpIt manages personal daily
  tasks, not multi-person projects, sprints, or backlogs. Features
  like assignees, sub-tasks, dependencies, and timelines are out of
  scope for V1.
- **Not a calendar.** DumpIt does not schedule tasks or block time.
  The priority system (alta/média/baixa) is the only temporal signal
  in V1.
- **Not a habit tracker.** Recurring tasks, streaks, and goal
  measurement are out of scope.
- **Not a note-taking app.** The task description field exists to
  clarify a task, not to replace a notes app.
- **Not a team product.** V1 is single-user, single-workspace.
  Collaboration features require a different product architecture and
  are not on the near-term roadmap.
