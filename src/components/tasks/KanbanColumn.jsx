import { AnimatePresence } from 'framer-motion'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Skeleton } from '../ui/skeleton'
import { TaskCard } from './TaskCard'
import { NewTaskButton } from './NewTaskButton'

const STATUS_CONFIG = {
  a_fazer: { label: 'A fazer', dot: 'hsl(var(--status-todo))' },
  fazendo: { label: 'Fazendo', dot: 'hsl(var(--status-doing))' },
  feito:   { label: 'Feito',   dot: 'hsl(var(--status-done))' },
}

export function KanbanColumn({ id, tasks, loading, onEdit, onNewTask }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const taskIds = tasks.map((t) => t.id)
  const config = STATUS_CONFIG[id] || { label: id, dot: 'hsl(var(--status-todo))' }

  return (
    <div className="flex flex-col flex-none w-[300px] min-h-0 lg:flex-1 lg:w-auto lg:min-w-[260px]">

      <div style={{
        padding: '0 4px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: config.dot }} />
          <span style={{ fontSize: 'var(--fs-label)', fontWeight: 600, color: 'hsl(var(--text-primary))' }}>{config.label}</span>
          <span style={{ fontSize: 'var(--fs-meta)', fontWeight: 500, color: 'hsl(var(--text-secondary))' }}>
            {tasks.length}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, color: 'hsl(var(--text-secondary))', fontSize: 17, lineHeight: 1 }}>
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

      <div
        ref={setNodeRef}
        style={{
          background: isOver ? 'hsl(var(--brand) / 0.07)' : 'var(--col-body-bg)',
          border: '1px solid var(--col-body-border)',
          borderRadius: 16,
          padding: '10px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          flex: 1,
          minHeight: 200,
          overflowY: 'auto',
          outline: isOver ? '1.5px dashed hsl(var(--brand) / 0.5)' : 'none',
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
                fontSize: 'var(--fs-meta)',
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
