import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import { DndContext, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core'
import { KanbanColumn } from './KanbanColumn'
import { supabase } from '../../lib/supabase'

const COLUMNS = ['a_fazer', 'fazendo', 'feito']

function groupByStatus(tasks) {
  return COLUMNS.reduce((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status)
    return acc
  }, {})
}

export function KanbanBoard({ tasks, onTasksChange, loading }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )
  const grouped = groupByStatus(tasks)

  async function handleDragEnd(event) {
    const { active, over } = event
    if (!over) return

    const activeTask = tasks.find((t) => t.id === active.id)
    if (!activeTask) return

    const targetStatus = COLUMNS.includes(over.id)
      ? over.id
      : tasks.find((t) => t.id === over.id)?.status

    if (!targetStatus || targetStatus === activeTask.status) return

    const newPosition = grouped[targetStatus].length
    const prevTasks = tasks

    onTasksChange(tasks.map((t) => (
      t.id === activeTask.id ? { ...t, status: targetStatus, position: newPosition } : t
    )))

    const { error } = await supabase
      .from('tasks')
      .update({ status: targetStatus, position: newPosition })
      .eq('id', activeTask.id)

    if (error) {
      onTasksChange(prevTasks)
      toast.error('Algo deu errado. Tente novamente.')
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div style={{
        display: 'flex', gap: 12, padding: '0 20px 20px',
        overflowX: 'auto', flex: 1,
      }}>
        <AnimatePresence>
          {COLUMNS.map((id) => (
            <KanbanColumn
              key={id}
              id={id}
              tasks={grouped[id] || []}
              loading={loading}
            />
          ))}
        </AnimatePresence>
      </div>
    </DndContext>
  )
}
