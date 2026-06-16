# DumpIt — Project Kickoff / AI Context Briefing

> Documento de contexto completo. Objetivo: qualquer IA que ler este arquivo
> deve conseguir continuar o trabalho no projeto sem precisar de explicações
> adicionais sobre produto, stack, convenções ou estado atual.

---

## 1. O que é o DumpIt

**DumpIt** é um gerenciador de tarefas com IA, conversacional, em
**português brasileiro**. A proposta central:

> O usuário "desabafa" tudo que precisa fazer em linguagem natural — sem
> formulário, sem categorização manual — e a IA organiza automaticamente
> em um Kanban (A Fazer / Fazendo / Feito), com prioridade inferida.

**Diferenciador:** primeiro produto da categoria construído nativamente
para o mercado PT-BR, zero configuração necessária. Não é uma ferramenta
de produtividade genérica traduzida — toda a experiência (linguagem,
tom, fluxo) é pensada pro usuário brasileiro.

### Fluxo central do produto

```
Usuário escreve um "desabafo" em PT-BR
        ↓
IA extrai tarefas distintas + infere prioridade (alta/media/baixa)
        ↓
Tarefas aparecem organizadas no Kanban
        ↓
Usuário arrasta entre colunas conforme avança
        ↓
Check-in diário (futuro): resumo do dia + IA comenta o progresso
```

### Modelo de negócio (freemium)

| Plano | Preço | O que inclui |
| --- | --- | --- |
| **Free** | R$0 | Kanban manual **ilimitado e para sempre** + **1 chamada de IA vitalícia** (trial pra mostrar valor) |
| **Paid** | R$25/mês | IA ilimitada (parsing de desabafos + resumos diários) |

Regra de ouro: **tudo que envolve IA é pago** (desabafo, lembrete,
resumo). **Tudo que é manual (Kanban) é gratuito para sempre.** Essa
divisão é deliberada — o Kanban manual é o "produto base" que retém o
usuário; a IA é o upsell.

---

## 2. Estado atual do projeto

Sessões já entregues (issues fechadas, `phase:shipped`):

| Issue | Título | O que foi feito |
| --- | --- | --- |
| [#1](https://github.com/andrenxx/dumpit/issues/1) | Scaffold, project structure and authentication | Estrutura do projeto, schema Supabase, auth via magic link |
| [#3](https://github.com/andrenxx/dumpit/issues/3) | Add ESLint and Vitest | Gates de qualidade (`npm run lint`, `npm run test`) |
| [#5](https://github.com/andrenxx/dumpit/issues/5) | AI parse-tasks endpoint | Backend completo: `POST /api/parse-tasks` parseando desabafos via Claude e persistindo no Supabase |

**O backend de IA está validado e funcionando em produção** (Cloudflare
Pages Functions + Claude Haiku). O que falta agora é **inteiramente
frontend**: tela de desabafo, Kanban visual, drag-and-drop.

### O que já existe em `src/`

```
src/
├── App.jsx                       ← roteamento raiz
├── components/auth/
│   ├── AuthGuard.jsx              ← protege rotas autenticadas
│   └── LoginModal.jsx             ← magic link
├── hooks/
│   └── useAuth.js                 ← estado de sessão Supabase
├── lib/
│   └── supabase.js                ← client Supabase (anon key)
├── pages/
│   ├── Dashboard.jsx               ← placeholder pós-login
│   └── Landing.jsx                 ← página pública
├── index.css
└── main.jsx
```

Não existe ainda: nenhum componente de Kanban, card de tarefa, input de
desabafo, ou lógica de drag-and-drop — mesmo as libs (`@dnd-kit/core`,
`@dnd-kit/sortable`) já estarem instaladas, prontas pra uso.

### Backend já implementado

**`functions/api/parse-tasks.js`** — Cloudflare Pages Function:

```
POST /api/parse-tasks
Authorization: Bearer <supabase-jwt>
Content-Type: application/json

{ "text": "<desabafo em PT-BR>" }

→ 200 { tasks: [{ id, user_id, title, priority, status, ... }] }
→ 401 unauthorized (sem JWT válido)
→ 402 upgrade_required (free plan, já usou a 1 call vitalícia)
→ 400 text_required
→ 502 ai_unavailable (erro na chamada da IA)
```

Fluxo interno: valida JWT → checa plano e quota → chama
`claude-haiku-4-5-20251001` com prompt estruturado → insere tasks no
Supabase → loga em `ai_conversations` → incrementa `ai_usage`.

**Regras de prioridade no prompt** (já calibradas e testadas):
- `alta`: deadline explícito (hoje, amanhã, horário específico), palavras
  como urgente, cliente, impacto financeiro
- `media`: tarefa de trabalho ativa, sem deadline claro
- `baixa`: recados, compras, tarefas pessoais sem prazo

Tem um modo `DEV_BYPASS=true` (só em `.dev.vars`, nunca em produção —
guardado contra `CF_PAGES_BRANCH === 'main'`) que pula auth pra testes
locais rápidos de parsing sem precisar de JWT.

---

## 3. Stack técnica

| Camada | Tecnologia | Detalhe |
| --- | --- | --- |
| Frontend | React 18 + Vite 5 | SPA, sem SSR |
| Roteamento | React Router 6 | |
| Estilo | Tailwind CSS 3 | |
| Drag-and-drop | `@dnd-kit/core` + `@dnd-kit/sortable` | instalado, não usado ainda |
| Backend | Cloudflare Pages Functions | Workers runtime (V8 isolates) — **não é Node.js**, sem `process.env` |
| Banco + Auth | Supabase (Postgres + RLS + magic link) | |
| IA | `claude-haiku-4-5-20251001` (Anthropic) | parsing de tarefas e resumos diários |
| Push notifications | Web Push API + VAPID keys | planejado, não implementado |
| Cron | Cloudflare Workers Cron Trigger | planejado, pro check-in diário às 18h BRT |
| Deploy | Cloudflare Pages | `git push` → produção automática |

### Variáveis de ambiente

```
VITE_SUPABASE_URL          # público, protegido por RLS
VITE_SUPABASE_ANON_KEY     # público, protegido por RLS
SUPABASE_SERVICE_ROLE_KEY  # server-only
CLAUDE_API_KEY             # server-only — nunca prefixo VITE_
VAPID_PUBLIC_KEY           # server-only (push, futuro)
VAPID_PRIVATE_KEY          # server-only (push, futuro)
VAPID_SUBJECT              # server-only (push, futuro)
```

Local dev usa dois arquivos (ambos gitignored): `.env.local` (vars
`VITE_*`, lidas pelo Vite) e `.dev.vars` (vars server-only, lidas pelo
`wrangler pages dev`). Produção: tudo no Cloudflare Dashboard.

---

## 4. Schema do banco (Supabase / Postgres)

```sql
-- Extensão de auth.users
public.users (id, email, plan['free'|'paid'], created_at)

-- Tarefas — núcleo do produto
public.tasks (
  id, user_id, title, description,
  priority['alta'|'media'|'baixa'],
  status['a_fazer'|'fazendo'|'feito'],
  position,           -- ordem dentro da coluna do Kanban
  created_at, updated_at, deleted_at  -- soft delete
)

-- Histórico de IA (auditoria + debug)
public.ai_conversations (id, user_id, raw_input, parsed_tasks jsonb, created_at)

-- Rate limiting de IA
public.ai_usage (id, user_id, date, calls_count)  -- UNIQUE(user_id, date)

-- Check-in diário (futuro)
public.daily_checkins (id, user_id, date, tasks_completed uuid[], ai_summary)

-- Web push (futuro)
public.push_subscriptions (id, user_id, endpoint, p256dh, auth)
```

Todas as tabelas têm **RLS habilitado** com policy `auth.uid() = user_id`
(ou `= id` em `users`) — segurança garantida no nível do banco, não só
na aplicação.

`tasks.position` é a chave pro drag-and-drop: cada card tem uma posição
inteira dentro da sua coluna; reordenar = atualizar `position` (e
possivelmente `status`, se mudou de coluna).

---

## 5. Convenções de desenvolvimento

Este projeto segue **Spec-Driven Development com GitHub Issues como
fonte de verdade** (ver [ADR 0001](architecture/decisions/0001-spec-driven-workflow.md)).
Nenhuma mudança não-trivial entra sem spec aprovado.

### O loop

```
/discover → /spec → /spec-review → /implement → /code-review → /ship
```

Cada fase é um label no issue (`phase:discovery` → `phase:spec` →
`phase:implementing` → `phase:review` → `phase:shipped`). Mudanças
triviais (≤10 linhas, ≤2 arquivos) pulam o spec formal.

### Branches e commits

- Branch: `feat/N-<slug>`, `fix/N-<slug>`, `chore/N-<slug>` — `N` é o
  número do issue.
- Commits: [Conventional Commits](https://www.conventionalcommits.org/)
  com o issue como scope: `feat(#12): add kanban drag-and-drop`.
- Nunca commit direto na `main`.

### Linguagem

- Código, comentários, commits, specs, issues, PRs: **inglês**.
- Strings visíveis ao usuário (UI, mensagens de erro): **PT-BR**.
- Conversa com o time/IA: livre (português ou inglês).

### Cloudflare Pages Functions — regras específicas

- Vivem em `functions/*.js`, exportam `onRequest` ou `onRequestPost`
  (não é Express — retorna `Response`, não usa `(req, res)`).
- `context.env.VAR_NAME` — nunca `process.env`.
- Toda function valida o JWT do Supabase antes de processar.
- CORS liberado só pra `dumpit.com.br`, `www.dumpit.com.br`,
  `http://localhost:5173`.

### Proibições

- `console.log` em código commitado.
- Secrets hardcoded — tudo via env var.
- Qualquer key com secret prefixada `VITE_` (expõe no bundle do
  frontend).
- Chamadas de IA direto do frontend — sempre via `functions/`.

---

## 6. O que vem a seguir (próxima sessão)

**Foco: frontend completo do Kanban.** Decisões de UX/design ficam por
conta do founder (humano); a IA implementa depois de alinhado.

Escopo previsto (a confirmar via `/spec`):

1. **Tela de desabafo** — textarea + botão, chama
   `POST /api/parse-tasks`, mostra loading/erro.
2. **Quadro Kanban** — 3 colunas (`a_fazer`, `fazendo`, `feito`),
   renderiza `public.tasks` do usuário logado.
3. **Card de tarefa** — título, badge de prioridade (cores já validadas
   no teste local: vermelho=alta, amarelo=media, verde=baixa).
4. **Drag-and-drop** — usando `@dnd-kit` (já instalado), persiste mudança
   de `status`/`position` no Supabase.
5. **Gate de freemium na UI** — feedback visual quando free plan recebe
   402 (upgrade_required) da API.

Não implementado ainda e fora de escopo próximo (backlog):
- `functions/checkin-summary.js` (resumo diário de IA)
- Web push notifications
- Pagamento (Stripe ou equivalente)
- Edição/exclusão de tarefas via API (só existe criação em batch hoje)

---

## 7. Como continuar trabalhando aqui

1. Lê este arquivo primeiro.
2. Se for implementar algo novo: roda `/spec` (ou `/spec <issue-number>`
   se já existe issue de discovery).
3. Nunca edita código fora do fluxo `spec:approved` → `/implement` —
   há hooks (`PreToolUse`) que bloqueiam edição fora da lista de
   arquivos do spec.
4. Specs antigos ficam em `docs/specs/NNN-<slug>.md` — útil pra entender
   decisões já tomadas (ex: por que o rate limit é vitalício e não
   diário, por que Claude Haiku e não Sonnet).
5. `CLAUDE.md` e `AGENTS.md` na raiz têm o mesmo conteúdo de stack/
   convenções, mas focados em regras de execução pro agente — este
   arquivo (`PROJECT_KICKOFF.md`) é o briefing de produto e contexto.

---

## 8. Glossário rápido

| Termo | Significado |
| --- | --- |
| Desabafo | O texto livre que o usuário escreve com tudo que precisa fazer |
| `phase:*` | Label de issue indicando estado no fluxo spec-driven |
| `spec:approved` / `code:approved` | Labels de PR — gates obrigatórios pro merge |
| DEV_BYPASS | Flag de `.dev.vars` que pula auth em dev local — nunca em produção |
| Plano free / paid | Free = Kanban ilimitado + 1 IA vitalícia. Paid = IA ilimitada (R$25/mês) |
