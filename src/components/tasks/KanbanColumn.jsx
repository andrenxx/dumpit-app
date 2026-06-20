import { AnimatePresence } from 'framer-motion'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Skeleton } from '../ui/skeleton'
import { TaskCard } from './TaskCard'
import { NewTaskButton } from './NewTaskButton'

const STATUS_CONFIG = {
  a_fazer: { label: 'A fazer', tint: 'rgba(255,203,71,0.14)', dot: '#FFCB47' },
  fazendo: { label: 'Fazendo', tint: 'rgba(255,111,82,0.11)', dot: '#FF6F52' },
  feito:   { label: 'Feito',   tint: 'rgba(0,210,160,0.11)',  dot: '#00D2A0' },
}

export function KanbanColumn({ id, tasks, loading, onEdit, onNewTask }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const taskIds = tasks.map((t) => t.id)
  const config = STATUS_CONFIG[id] || { label: id, tint: 'transparent', dot: '#ccc' }

  return (
    <div style={{ flex: '0 0 300px', width: 300, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        className="flex items-center justify-between rounded-[14px] px-3 py-2"
        style={{
          background: `linear-gradient(${config.tint}, ${config.tint}), var(--col-header-bg)`,
          border: '1px solid var(--col-header-border)',
          backdropFilter: 'blur(20px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: config.dot, flexShrink: 0 }} />
          <span className="text-[12px] font-medium text-text-primary">{config.label}</span>
        </div>
        <span className="text-[11px] px-[7px] py-[1px] rounded-full text-text-hint"
              style={{ background: 'var(--glass-bg-strong)' }}>
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex flex-col gap-[7px] flex-1 overflow-y-auto p-[1px] rounded-[16px] transition-colors ${isOver ? 'glass-inset-highlight' : ''}`}
        style={{
          minHeight: 60,
          background: isOver ? 'hsl(var(--brand) / 0.05)' : 'transparent',
          outline: isOver ? '1.5px dashed hsl(var(--brand) / 0.2)' : 'none',
          outlineOffset: 2,
        }}
      >
        {loading ? (
          <>
            <Skeleton className="h-16 rounded-[16px]" />
            <Skeleton className="h-16 rounded-[16px]" />
            <Skeleton className="h-16 rounded-[16px]" />
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
                padding: '20px 8px',
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
