import { AnimatePresence } from 'framer-motion'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Skeleton } from '../ui/skeleton'
import { TaskCard } from './TaskCard'
import { NewTaskButton } from './NewTaskButton'

const STATUS_CONFIG = {
  a_fazer: { label: 'A fazer', gradient: 'var(--col-a_fazer-grad)' },
  fazendo: { label: 'Fazendo', gradient: 'var(--col-fazendo-grad)' },
  feito:   { label: 'Feito',   gradient: 'var(--col-feito-grad)'   },
}

export function KanbanColumn({ id, tasks, loading, onEdit, onNewTask }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const taskIds = tasks.map((t) => t.id)
  const config = STATUS_CONFIG[id] || { label: id, gradient: 'rgba(100,100,100,0.5)' }

  return (
    <div style={{ flex: '0 0 300px', width: 300, display: 'flex', flexDirection: 'column' }}>

      {/* Header — gradiente sólido, arredondado só no topo */}
      <div style={{
        background: config.gradient,
        padding: '12px 14px',
        borderRadius: '14px 14px 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>{config.label}</span>
          <span style={{
            fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)',
            background: 'rgba(255,255,255,0.18)', padding: '1px 8px', borderRadius: 20,
          }}>
            {tasks.length}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, color: 'rgba(255,255,255,0.8)', fontSize: 17, lineHeight: 1 }}>
          <button
            style={{ background: 'none', border: 'none', cursor: 'default', color: 'inherit', padding: 0, lineHeight: 1 }}
            aria-label="Mais opções"
          >⋯</button>
          <button
            onClick={onNewTask}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1, fontSize: 20 }}
            aria-label="Nova task"
          >+</button>
        </div>
      </div>

      {/* Body — conectado ao header, arredondado só na base */}
      <div
        ref={setNodeRef}
        style={{
          background: isOver ? 'hsl(var(--brand) / 0.07)' : 'var(--col-body-bg)',
          border: '1px solid var(--col-body-border)',
          borderTop: 'none',
          borderRadius: '0 0 16px 16px',
          padding: '10px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          flex: 1,
          minHeight: 200,
          overflowY: 'auto',
          outline: isOver ? '1.5px dashed hsl(var(--brand) / 0.25)' : 'none',
          outlineOffset: -2,
          transition: 'background 150ms ease',
        }}
      >
        {loading ? (
          <>
            <Skeleton className="h-16 rounded-[14px]" />
            <Skeleton className="h-16 rounded-[14px]" />
            <Skeleton className="h-16 rounded-[14px]" />
          </>
        ) : (
          <>
            <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
              <AnimatePresence>
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} onEdit={onEdit} />
                ))}
              </AnimatePresence>
            </SortableContext>

            {tasks.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '24px 8px',
                color: 'hsl(var(--text-hint))',
                fontSize: 11.5,
                fontWeight: 500,
                wordBreak: 'break-word',
                width: '100%',
              }}>
                Nada por aqui ainda
              </div>
            )}

            <NewTaskButton onNewTask={onNewTask} />
          </>
        )}
      </div>
    </div>
  )
}
