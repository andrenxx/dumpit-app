# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
People in Brazil who carry too many loose tasks in their heads and do not want to configure a task app. Confirmed audiences, all equally primary:

- Overloaded professionals (meetings, client deliveries, supplier calls), on desktop or phone.
- Students juggling exams, assignments, and deadlines.
- Anyone who writes in PT-BR and has no patience for projects, tags, or lists.
- Freelancers and self-employed people who mix work and personal tasks and have no team.

Situation: they sit down, pour out everything they have to do as free text, and expect an organized board back.

## Product Purpose
DumpIt is an AI task manager in Brazilian Portuguese. The user dumps tasks in natural language, the AI parses them into a Kanban board (a fazer / fazendo / feito), and the user manages the board manually from there. A daily check-in routine to close the day is part of the product vision.

## Positioning
Natural-language dump in PT-BR with no configuration. Nothing to set up before the first dump: the user writes, the board appears. Confirmed as the differentiator.

## Operating Context
- Web app, used on desktop and phone with equal importance. Desktop (PC) is a first-class target and is currently under-served by the mobile-only layout.
- The first dump can happen before account creation; login is requested when the user submits (anonymous dump, then login overlay on 401, then the dump is resent).
- Sign-up and sign-in are email and password via Supabase Auth.
- The Kanban supports drag and drop between three columns and manual task creation.

## Capabilities and Constraints
Confirmed:

- Frontend: React 18, Vite 5, React Router 6, Tailwind CSS 3, @dnd-kit.
- All user-facing copy is pt-BR.
- AI parsing moves to Google Gemini (free tier), replacing Claude Haiku. Migration of `functions/parse-tasks.js` is decided but not done yet.
- Light and dark themes exist today.

Undecided (do not treat as fact):

- Pricing model. The repository still describes a freemium model (1 free AI call, paid plan at R$25/month), but the owner has discussed making the product free and adding paid features later. Not confirmed here.
- Backend and database stack. A move from Cloudflare Pages Functions + Supabase to Docker + self-hosted PostgreSQL + Better Auth is under evaluation, not decided.
- Production login and sign-up currently fail for the owner; root cause not yet diagnosed.

## Brand Commitments
- Name: DumpIt, written lowercase "dump" with "it" in a highlighted chip in the top bar.
- Mascot: a penguin character (assets in the repository) that appears on the welcome and dump screens.
- Voice: informal, direct, PT-BR second person ("Joga tudo que tá na sua cabeça. Eu cuido do resto.").

## Evidence on Hand
- A live deployment at https://dumpit-ei4.pages.dev/.
- Source repository: https://github.com/andrenxx/dumpit-app.
- No customer testimonials, usage numbers, or press exist. Future work must not invent any.

## Product Principles
- Zero setup: the first value (organized board) comes before configuration or, as far as possible, before account creation.
- Natural language first: free text in PT-BR is the primary input; structure is the product's job, not the user's.
- Desktop and mobile are both first-class; neither is an afterthought of the other.
- Native PT-BR: copy, dates, and tone are written for Brazilian users, not translated.
- The board stays simple: a small number of columns and manual control after the AI's first pass.

## Accessibility & Inclusion
No product-specific standard has been stated. Working target for new design work: WCAG AA contrast, keyboard operability, and visible focus, to be confirmed with the owner.
