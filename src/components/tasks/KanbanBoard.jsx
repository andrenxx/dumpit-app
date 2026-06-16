import { DndContext, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core'
import { KanbanColumn } from './KanbanColumn'
import { supabase } from '../../lib/supabase'

const COLUMNS = [
  { id: 'a_fazer', dotColor: '#C8BAB0', label: 'A fazer' },
  { id: 'fazendo', dotColor: '#F59E0B', label: 'Fazendo' },
  { id: 'feito', dotColor: '#22C55E', label: 'Feito' },
]
const COLUMN_IDS = COLUMNS.map((c) => c.id)

function groupByStatus(tasks) {
  return COLUMN_IDS.reduce((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status)
    return acc
  }, {})
}

export function KanbanBoard({ tasks, onTasksChange, onError }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )
  const grouped = groupByStatus(tasks)

  async function handleDragEnd(event) {
    const { active, over } = event
    if (!over) return

    const activeTask = tasks.find((t) => t.id === active.id)
    if (!activeTask) return

    const targetStatus = COLUMN_IDS.includes(over.id)
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
      onError()
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div style={{
        display: 'flex', gap: 12, padding: '0 20px 20px',
        overflowX: 'auto', flex: 1,
      }}>
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            dotColor={col.dotColor}
            label={col.label}
            tasks={grouped[col.id] || []}
          />
        ))}
      </div>
    </DndContext>
  )
}
