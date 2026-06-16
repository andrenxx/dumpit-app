# Spec 007 — Frontend completo: tela de Dump e Kanban de tarefas

| Field    | Value                                                                                |
| -------- | ------------------------------------------------------------------------------------ |
| Issue    | [#7](https://github.com/andrenxx/dumpit/issues/7)                                    |
| Branch   | `feat/7-frontend-completo-tela-de-dump-e-kanban`                                     |
| Status   | Draft — awaiting review                                                              |
| Type     | feature                                                                              |

## 1. Context

O backend de IA (`POST /api/parse-tasks`, issue #5) já está implementado,
testado e shipado. Ele recebe um texto livre em PT-BR, chama
`claude-haiku-4-5-20251001`, e persiste as tarefas extraídas no Supabase.

O que falta é inteiramente o frontend: a tela onde o usuário escreve o
desabafo, e o Kanban onde as tarefas aparecem organizadas e podem ser
arrastadas entre colunas.

Design e wireframe já foram decididos pelo founder fora do fluxo de
spec — um documento de design (`FRONTEND_SPEC.md`, fornecido pelo
founder) e um wireframe HTML estático (`docs/wireframe_v3.html`, cópia
fiel nesta spec) servem de referência pixel-a-pixel. Este spec traduz
essas decisões para o formato do projeto; nenhuma decisão de design
nova é tomada aqui.

## 2. Goals

- App com duas páginas — "Dump" e "Tarefas" — navegadas por bottom nav,
  sem React Router (estado local `activePage` em `App.jsx`).
- Tela de Dump: textarea + botão que chama `POST /api/parse-tasks`,
  com loading overlay global e exemplo clicável.
- Gate freemium (402) tratado inline na tela de Dump, sem modal.
- Tela de Tarefas: busca `public.tasks` do usuário logado no Supabase,
  agrupa por `status`, renderiza em 3 colunas fixas.
- Drag-and-drop entre colunas via `@dnd-kit`, persistindo `status` e
  `position` no Supabase, com reversão em caso de erro.
- Fidelidade visual ao wireframe de referência: tokens de cor,
  tipografia, border-radius, e regras absolutas de estilo (sem sombra,
  sem gradiente, sem cor de ação fora de `--brand`).

## 2.5 Validation strategy

Validação manual via browser, comparando lado a lado com
`docs/wireframe_v3.html` aberto localmente:

1. Abrir a tela de Dump — hero, input com borda brand, exemplo
   clicável, contador de caracteres.
2. Clicar no exemplo → preenche o textarea e foca.
3. Submeter um desabafo real → loading overlay aparece → no sucesso,
   navega pra Tarefas com as tasks novas visíveis.
4. Simular 402 (usuário free que já gastou a call) → FreemiumBanner
   aparece no lugar do fluxo normal, sem quebrar o layout.
5. Abrir a tela de Tarefas com tasks existentes → 3 colunas populadas,
   contagem correta no header de cada coluna.
6. Arrastar um card entre colunas → persiste no Supabase (refresh
   confirma) → estado otimista reverte se a escrita falhar.
7. Coluna vazia → mostra apenas o `NewTaskButton`, sem placeholder
   decorativo.
8. Comparar visualmente cada tela com o wireframe — cores, radius,
   tipografia — usando o DevTools para inspecionar valores computados.

## 3. Non-goals

- Edição de task (clique no ícone ✎) — ícone aparece, sem ação.
- Exclusão de task.
- Pagamento / Stripe — o botão "Assinar plano pago" não tem ação real.
- Check-in diário.
- Web push notifications.
- Filtros no header da tela de Tarefas — espaço reservado, sem lógica.
- Criação manual de task via `NewTaskButton` — botão visível, sem ação
  (vai exigir endpoint novo, fora de escopo aqui).

## 4. Design

### 4.1 Estrutura de arquivos

```
src/
├── pages/
│   ├── DumpPage.jsx
│   └── TasksPage.jsx
├── components/
│   ├── layout/
│   │   ├── TopBar.jsx
│   │   └── BottomNav.jsx
│   ├── dump/
│   │   ├── DumpInput.jsx
│   │   └── ExampleCard.jsx
│   ├── tasks/
│   │   ├── KanbanBoard.jsx
│   │   ├── KanbanColumn.jsx
│   │   ├── TaskCard.jsx
│   │   └── NewTaskButton.jsx
│   └── ui/
│       ├── Badge.jsx
│       ├── LoadingOverlay.jsx
│       └── FreemiumBanner.jsx
└── App.jsx  (modificado)
```

### 4.2 Design tokens

Adicionados em `src/index.css`, dentro de `:root`:

```css
:root {
  --bg-app:           #FAF8F4;
  --bg-card:          #FFFFFF;
  --bg-accent-light:  #EEEAFF;

  --text-primary:     #1C1714;
  --text-secondary:   #8A7A6E;
  --text-hint:        #C8BAB0;

  --brand:            #2B1C9A;
  --brand-hover:      rgba(43,28,154,0.25);
  --brand-light:      rgba(43,28,154,0.07);

  --border-default:   rgba(60,40,20,0.09);
  --border-strong:    rgba(60,40,20,0.15);

  --badge-urgente-bg:   #FFF0EE;
  --badge-urgente-text: #B83A24;
  --badge-normal-bg:    #FFF6E2;
  --badge-normal-text:  #8A6200;
  --badge-depois-bg:    #F2EFE9;
  --badge-depois-text:  #7A6A5A;
}

body {
  background: var(--bg-app);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: var(--text-primary);
}
```

**Regras absolutas de estilo** (aplicam-se a todo componente novo):

- Sem `box-shadow` decorativo.
- Sem gradientes.
- Sem cor de ação além de `--brand` (`#2B1C9A`).
- Sem bordas coloridas fora de estado de foco/drag.
- Sem `font-weight` acima de 500.
- Sem texto menor que 11px.
- Dark mode fora de escopo.

**Tipografia:**

| Elemento            | font-size | font-weight | color               |
| -------------------- | --------- | ----------- | ------------------- |
| Hero headline        | 23px      | 500         | `--text-primary`    |
| Logo "dumpit"        | 17px      | 500         | `--brand`            |
| Título de card       | 13px      | 500         | `--text-primary`    |
| Descrição / suporte  | 13px      | 400         | `--text-secondary`  |
| Label / meta         | 11px      | 400         | `--text-hint`       |
| Badge                | 11px      | 500         | (varia por variante)|
| Botão primário       | 13px      | 500         | `#FFFFFF`            |
| Botão ghost          | 12px      | 400         | `--text-secondary`  |

`letter-spacing: -0.3px` apenas em headlines (hero e logo). `0` no
restante. `line-height: 1.65` em textareas e parágrafos.

**Border radius:**

| Contexto                  | Valor |
| -------------------------- | ----- |
| Modal / loading overlay    | 24px  |
| Card de task               | 16px  |
| Input de dump (box)        | 20px  |
| Botão primário             | 10px  |
| Botão ghost                | 9px   |
| Badge                      | 6px   |
| Col header                 | 12px  |
| Tab pill container         | 14px  |
| Tab pill item              | 10px  |
| "Nova task" btn            | 14px  |
| Avatar                     | 50%   |

### 4.3 App.jsx — shell e roteamento

> **Nota de implementação (deviation):** `App.jsx` já existia com
> React Router (`/` → `Landing`, `/dashboard` → `AuthGuard` +
> `Dashboard`) do trabalho de auth shipado na issue #1. O router
> público é mantido; o shell abaixo (`AppShell`) substitui o conteúdo
> que era renderizado em `Dashboard` na rota `/dashboard`, ainda
> dentro do `AuthGuard`. Navegação **dentro** do shell (Dump ↔
> Tarefas) continua sem React Router, via estado local, como descrito
> originalmente.

Duas páginas dentro do shell autenticado, sem React Router para a
navegação interna (estado local):

```jsx
function AppShell() {
  const [activePage, setActivePage] = useState('dump') // 'dump' | 'tasks'
  const [loading, setLoading] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh',
      maxWidth: 480, margin: '0 auto', overflow: 'hidden', background: 'var(--bg-app)' }}>
      <TopBar />
      <LoadingOverlay visible={loading} />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activePage === 'dump'
          ? <DumpPage setLoading={setLoading} onSuccess={() => setActivePage('tasks')} />
          : <TasksPage />}
      </div>
      <BottomNav activePage={activePage} onChange={setActivePage} />
    </div>
  )
}

// App.jsx default export — router preservado da issue #1
const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/dashboard', element: <AuthGuard><AppShell /></AuthGuard> },
])

export default function App() {
  return <RouterProvider router={router} />
}
```

### 4.4 TopBar e BottomNav

- **TopBar**: padding `14px 20px 10px`, sem `border-bottom`. Logo
  "dumpit" (17px/500/`--brand`). Avatar circular 30px com iniciais do
  usuário (via `useAuth`), bg `--bg-accent-light`, texto `--brand`.
- **BottomNav**: dois itens fixos — "Dump" (`✦`) e "Tarefas" (`☰`).
  Container `bg-card`, `border-top: 0.5px solid --border-default`,
  altura 64px. Item ativo em `--brand`, inativo em `--text-hint`,
  transição de cor 0.15s.

### 4.5 DumpPage

Layout `flex-col`, `padding: 20px 20px 0`, `justify-content:
space-between`.

**Hero:** h1 "O que tá na sua cabeça?" (23px/500), parágrafo "Joga
tudo aqui. A IA organiza pra você." (13px, `--text-secondary`).

**DumpInput:** container com borda `1.5px solid --brand` *sempre
ativa* (não só no foco), `border-radius: 20px`. Textarea sem borda
interna, `min-height: 160px`, `maxLength={1000}`. Rodapé com separador
(`hr` 0.5px) mostrando contador `{n} / 1000` à esquerda e botão
primário "Dump ✦" à direita.

**ExampleCard:** card clicável que preenche o textarea com um exemplo
fixo e foca nele. Label "💡 Clique pra testar" em uppercase, 11px.

**FreemiumBanner:** exibido apenas quando a API retorna 402. Borda sutil
em tom de alerta (`rgba(184,58,36,0.2)`), texto explicando o gate e
botão "Assinar plano pago" (sem ação real nesta spec).

**Fluxo de submit:**

```
1. Clique em "Dump ✦"
2. Textarea vazio → foca o textarea, não faz nada
3. Textarea preenchido:
   a. setLoading(true) → LoadingOverlay visível
   b. POST /api/parse-tasks { text }
   c. 200 → setLoading(false) → limpa textarea → onSuccess()
      (onSuccess navega pra Tarefas e refetch das tasks)
   d. 402 → setLoading(false) → exibe FreemiumBanner
   e. outro erro → setLoading(false) → toast genérico
```

### 4.6 LoadingOverlay

Overlay absoluto full-screen (`inset: 0`, `z-index: 50`), spinner
36px com borda `--brand` animada, texto "Organizando suas
tarefas..." + subtexto "A IA está lendo e classificando tudo".
Visível apenas quando `visible={true}`.

### 4.7 TasksPage

Header: título "Tarefas" (14px/500) + contagem "{n} tarefas" (11px,
`--text-hint`). Sem filtros nesta spec (espaço reservado).

**Busca de dados ao montar:**

```js
const { data: tasks } = await supabase
  .from('tasks')
  .select('*')
  .is('deleted_at', null)
  .order('position', { ascending: true })

const grouped = {
  a_fazer: tasks.filter(t => t.status === 'a_fazer'),
  fazendo: tasks.filter(t => t.status === 'fazendo'),
  feito:   tasks.filter(t => t.status === 'feito'),
}
```

Loading state: 3 skeleton cards por coluna (`bg: #F0ECE6`,
`animate-pulse`). Coluna vazia: nenhum elemento decorativo — só o
`NewTaskButton`.

### 4.8 KanbanBoard / KanbanColumn

`KanbanBoard`: `display: flex`, `gap: 12px`, `overflow-x: auto`,
scrollbar escondida. 3 colunas fixas, nesta ordem:

| Coluna    | Dot color | Label      |
| --------- | --------- | ---------- |
| `a_fazer` | `#C8BAB0` | "A fazer"  |
| `fazendo` | `#F59E0B` | "Fazendo"  |
| `feito`   | `#22C55E` | "Feito"    |

`KanbanColumn`: `min-width: 240px`. Header com dot + label + pill de
contagem (`bg: #F0ECE6`). Drop zone visual durante drag: `bg:
--brand-light`, `outline: 1.5px dashed rgba(43,28,154,0.2)`.

### 4.9 TaskCard / Badge

```
task = { id, title, priority: 'alta'|'media'|'baixa', status }

Mapeamento priority → badge:
  alta  → "Urgente"     (bg #FFF0EE, text #B83A24)
  media → "Normal"      (bg #FFF6E2, text #8A6200)
  baixa → "Quando der"  (bg #F2EFE9, text #7A6A5A)
```

Estado repouso: `bg-card`, borda 0.5px `--border-default`,
`border-radius: 16px`, `cursor: grab`. Hover: borda `--brand-hover`.
Estado `done` (status `feito`): `opacity: 0.5`, título com
`line-through`.

Estrutura: topo com título + ícone `✎` (sem ação); base com `Badge` à
esquerda e ícone `⠿` (handle de drag, opacity 0 em repouso → 1 no
hover).

### 4.10 Drag-and-drop com `@dnd-kit`

```jsx
import {
  DndContext, DragOverlay,
  PointerSensor, useSensor, useSensors,
  closestCorners
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
```

`PointerSensor` com `activationConstraint: { distance: 8 }` (evita
drag acidental em toque rápido no mobile).

Em `onDragEnd`:
1. Identifica coluna de destino pelo `over.id`.
2. Atualiza estado local **otimisticamente** (antes do `await`).
3. Se mudou de coluna: `UPDATE tasks SET status = ?, position = ?
   WHERE id = ?` no Supabase.
4. Em caso de erro: reverte o estado local e mostra toast.

### 4.11 NewTaskButton

Botão fantasma full-width em cada coluna, ícone `+` em `--brand` +
texto "Nova task". **Sem ação nesta spec** — placeholder visual pra
issue futura de criação manual.

### 4.12 Estados especiais

- **Toast de erro genérico**: "Algo deu errado. Tente novamente."
  Aparece no topo, desaparece após 3s.
- **Skeleton de loading**: 3 cards placeholder por coluna,
  `animate-pulse`.

## 4.5 UX decision

N/A — decisões de UX e visual já tomadas pelo founder fora do fluxo de
spec, documentadas no wireframe de referência
(`docs/wireframe_v3.html`) e detalhadas nas seções 4.2–4.12 acima.
Não há opções alternativas a avaliar aqui.

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `docs/wireframe_v3.html` | create | Referência visual estática, cópia do wireframe fornecido |
| `src/index.css` | modify | Adiciona os design tokens (§4.2) |
| `src/App.jsx` | modify | Router preservado (issue #1) + `AppShell` com `activePage`/`loading` state na rota `/dashboard` (§4.3) |
| `src/pages/Dashboard.jsx` | delete | Substituído por `AppShell` em `App.jsx` |
| `src/components/layout/TopBar.jsx` | create | §4.4 |
| `src/components/layout/BottomNav.jsx` | create | §4.4 |
| `src/pages/DumpPage.jsx` | create | §4.5 |
| `src/components/dump/DumpInput.jsx` | create | §4.5 |
| `src/components/dump/ExampleCard.jsx` | create | §4.5 |
| `src/components/ui/FreemiumBanner.jsx` | create | §4.5 |
| `src/components/ui/LoadingOverlay.jsx` | create | §4.6 |
| `src/pages/TasksPage.jsx` | create | §4.7 |
| `src/components/tasks/KanbanBoard.jsx` | create | §4.8, §4.10 |
| `src/components/tasks/KanbanColumn.jsx` | create | §4.8 |
| `src/components/tasks/TaskCard.jsx` | create | §4.9 |
| `src/components/ui/Badge.jsx` | create | §4.9 |
| `src/components/tasks/NewTaskButton.jsx` | create | §4.11 |

## 6. Acceptance

- [ ] `src/index.css` contém todos os tokens de §4.2.
- [ ] TopBar renderiza logo + avatar com iniciais do usuário logado.
- [ ] BottomNav alterna entre Dump e Tarefas; item ativo em `--brand`.
- [ ] DumpPage com hero, input de borda brand sempre visível, exemplo
      clicável que preenche e foca o textarea.
- [ ] Submit chama `POST /api/parse-tasks` real; sucesso navega pra
      Tarefas com loading overlay visível durante a chamada.
- [ ] Resposta 402 exibe FreemiumBanner no lugar do fluxo normal.
- [ ] TasksPage busca tasks reais do Supabase do usuário logado,
      agrupadas por status, com skeleton durante o loading.
- [ ] KanbanBoard renderiza 3 colunas na ordem a_fazer/fazendo/feito
      com contagem correta em cada header.
- [ ] TaskCard mostra badge mapeado corretamente
      (alta→Urgente, media→Normal, baixa→Quando der) e estado `done`
      quando status é `feito`.
- [ ] Drag-and-drop entre colunas persiste `status`/`position` no
      Supabase; falha de escrita reverte o estado local visualmente.
- [ ] Coluna vazia mostra apenas o NewTaskButton, sem placeholder
      decorativo.
- [ ] `npm run lint` passando.
- [ ] `npm run test` passando.

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| Drag-and-drop em mobile (touch) disparar acidentalmente | `PointerSensor` com `activationConstraint: { distance: 8 }` |
| Reordenar `position` gerar conflitos em concorrência (dois dispositivos) | Fora de escopo nesta spec — único usuário, único dispositivo ativo por sessão; revisar se multi-dispositivo se tornar real |
| Fidelidade visual exata ao wireframe (cores, espaçamentos) divergir em produção | Validação manual lado a lado com `docs/wireframe_v3.html`, antes do `/code-review` |
| Toast de erro genérico esconder causas reais de falha (debug mais difícil) | Aceitável para V1; logging client-side pode ser adicionado depois sem mudar UX |

## 8. Rollout

Múltiplos commits agrupados por área (layout → dump → tasks → drag-and-drop),
um PR único. Sem migrations — schema já existe (`public.tasks`).
Validação manual via browser comparando com o wireframe antes de abrir
para `/code-review`.

---

**Reviewer checklist:**

- Goals are achievable inside this PR.
- Non-goals are explicit; nothing snuck in.
- File list is complete.
- Acceptance criteria are objective.
