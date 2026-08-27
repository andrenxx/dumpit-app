# DumpIt

> Despeje tudo o que está na sua cabeça. A IA organiza em tarefas no Kanban.


---

## O que é

DumpIt é um gerenciador de tarefas com IA para desenvolvedores brasileiros. Em vez de criar tarefas manualmente, o usuário escreve um dump de texto livre — "preciso terminar o PR, ligar pro cliente antes das 18h, revisar a infra de produção" — e a IA extrai, prioriza e organiza tudo em um Kanban automaticamente.

O produto é gratuito.

---

## Stack

| Camada | Tecnologia | Decisão |
| ------ | ---------- | ------- |
| Frontend | React 18 + Vite | SPA com HMR e code splitting |
| Deploy | Cloudflare Pages | Edge global, zero cold start |
| Backend | Cloudflare Workers (Pages Functions) | Lógica de auth e IA no edge, sem servidor |
| Banco | Supabase (PostgreSQL) | Auth built-in, RLS, triggers |
| IA | Claude API (Haiku) | Parsing de PT-BR → JSON de tarefas |
| Animações | Framer Motion | Transições de kanban e drag-and-drop |
| Drag & Drop | dnd-kit | Reordenação de tarefas entre colunas |
| Testes | Vitest | Unit tests para utilitários puros |

---

## Arquitetura

```
Browser (React + Vite)
        │
        │  /api/*  (proxy Vite → Worker em dev)
        ▼
Cloudflare Worker  ──►  Claude API  (parse-tasks)
        │
        ▼
   Supabase (PostgreSQL)
   ├── public.users      (perfil + plano)
   ├── public.tasks      (kanban tasks com soft delete)
   ├── public.ai_usage   (registro de chamadas de IA)
   └── public.ai_conversations (histórico de dumps)
```

**Fluxo principal:**
1. Usuário escreve texto livre no DumpPage
2. Frontend envia `POST /api/parse-tasks` com o JWT do usuário
3. Worker valida o JWT via Supabase, chama a Claude API com o dump
4. Claude retorna um array JSON de tarefas com título, prioridade e status
5. Worker salva no banco e retorna as tarefas; frontend popula o Kanban

---

## Decisões técnicas notáveis

**Cloudflare Workers em vez de um servidor tradicional**
A lógica de negócio roda no edge (sem região fixa, sem cold start significativo). O worker tem acesso a variáveis de ambiente seguras via `context.env` — nenhuma chave de API toca o frontend.

**GitHub Issues como fonte de verdade**
Cada feature tem uma issue rastreável com problema, opções consideradas e critério de validação antes de qualquer código ser escrito. O histórico de decisões de arquitetura está em `docs/architecture/decisions/`.

**RLS no Supabase**
Row Level Security garante que cada query retorna apenas dados do usuário autenticado — sem filtros manuais no código de produto.

**Soft delete com flag de posição**
Tasks deletadas mantêm `deleted_at` para auditoria; a posição no Kanban é um inteiro ordinal que o dnd-kit reordena sem UUIDs de ordem.

---

## Desenvolvimento local

→ [docs/SETUP.md](docs/SETUP.md)

---

## Estrutura do projeto

```
dumpit/
├── src/
│   ├── components/       # React components (auth, layout, tasks)
│   ├── hooks/            # useAuth, useTheme
│   ├── pages/            # Landing, DumpPage, TasksPage
│   └── utils/            # Utilitários puros testados
├── functions/
│   └── api/
│       └── parse-tasks.js  # Cloudflare Worker — auth + IA + DB
├── supabase/
│   └── migrations/       # 4 migrações SQL versionadas
└── docs/
    ├── specs/            # Specs de cada feature (NNN-slug.md)
    ├── architecture/     # ADRs
    └── SETUP.md          # Guia de setup local
```
