import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { KanbanColumn } from './KanbanColumn'
import { TaskModal } from './TaskModal'
import { TaskCardDragClone } from './TaskCard'
import { supabase } from '../../lib/supabase'

const COLUMNS = ['a_fazer', 'fazendo', 'feito']

function groupByStatus(tasks) {
  return COLUMNS.reduce((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status)
    return acc
  }, {})
}

export function KanbanBoard({ tasks, onTasksChange, loading, user }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  )
  const [editingTask, setEditingTask] = useState(null)
  const [creatingColumn, setCreatingColumn] = useState(null)
  const [activeTask, setActiveTask] = useState(null)
  const pendingDeleteRef = useRef(null)
  const tempIdRef = useRef(0)
  const grouped = groupByStatus(tasks)

  function handleDragStart(event) {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  async function handleDragEnd(event) {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const activeTask = tasks.find((t) => t.id === active.id)
    if (!activeTask) return

    const targetStatus = COLUMNS.includes(over.id)
      ? over.id
      : tasks.find((t) => t.id === over.id)?.status

    if (!targetStatus) return

    const prevTasks = tasks

    if (targetStatus === activeTask.status) {
      const col = grouped[targetStatus]
      const oldIdx = col.findIndex((t) => t.id === active.id)
      const newIdx = col.findIndex((t) => t.id === over.id)
      if (oldIdx === newIdx) return

      const reordered = arrayMove(col, oldIdx, newIdx)
      const updatedTasks = tasks.map((t) => {
        const pos = reordered.findIndex((r) => r.id === t.id)
        return pos !== -1 ? { ...t, position: pos } : t
      })
      onTasksChange(updatedTasks)

      const { error } = await Promise.all(
        reordered.map((t, i) => supabase.from('tasks').update({ position: i }).eq('id', t.id))
      ).then((results) => results.find((r) => r.error) || { error: null })

      if (error) {
        onTasksChange(prevTasks)
        toast.error('Algo deu errado. Tente novamente.')
      }
    } else {
      const newPosition = grouped[targetStatus].length
      onTasksChange(tasks.map((t) =>
        t.id === activeTask.id ? { ...t, status: targetStatus, position: newPosition } : t
      ))

      const { error } = await supabase
        .from('tasks')
        .update({ status: targetStatus, position: newPosition })
        .eq('id', activeTask.id)

      if (error) {
        onTasksChange(prevTasks)
        toast.error('Algo deu errado. Tente novamente.')
      }
    }
  }

  async function handleCreate(columnStatus, { title, description, priority }) {
    if (!user) return
    const tempId = `temp-${++tempIdRef.current}`
    const tempTask = {
      id: tempId,
      title,
      description: description || null,
      priority,
      status: columnStatus,
      position: grouped[columnStatus].length,
      user_id: user.id,
    }
    onTasksChange([...tasks, tempTask])

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title,
        description: description || null,
        priority,
        status: columnStatus,
        position: grouped[columnStatus].length,
        user_id: user.id,
      })
      .select()
      .single()

    if (error || !data) {
      onTasksChange(tasks.filter((t) => t.id !== tempId))
      toast.error('Algo deu errado. Tente novamente.')
    } else {
      onTasksChange((prev) => prev.map((t) => (t.id === tempId ? data : t)))
    }
  }

  async function handleSave({ id, title, description, priority }) {
    const prevTasks = tasks
    onTasksChange(tasks.map((t) => (t.id === id ? { ...t, title, description, priority } : t)))

    const { error } = await supabase
      .from('tasks')
      .update({ title, description: description || null, priority })
      .eq('id', id)

    if (error) {
      onTasksChange(prevTasks)
      toast.error('Algo deu errado. Tente novamente.')
    }
  }

  function handleDelete(id) {
    const taskToDelete = tasks.find((t) => t.id === id)
    if (!taskToDelete) return

    // Disable undo for any previous pending delete
    if (pendingDeleteRef.current) {
      clearTimeout(pendingDeleteRef.current.timeout)
      pendingDeleteRef.current = null
    }

    // Remove from UI and write to DB immediately so re-fetches exclude this task
    onTasksChange(tasks.filter((t) => t.id !== id))
    supabase.from('tasks').update({ deleted_at: new Date().toISOString() }).eq('id', id).then()

    const timeout = setTimeout(() => { pendingDeleteRef.current = null }, 4000)
    pendingDeleteRef.current = { id, task: taskToDelete, timeout }

    toast('Task excluída', {
      action: {
        label: 'Desfazer',
        onClick: () => {
          if (!pendingDeleteRef.current || pendingDeleteRef.current.id !== id) return
          clearTimeout(pendingDeleteRef.current.timeout)
          pendingDeleteRef.current = null
          onTasksChange((prev) => {
            const idx = prev.findIndex((t) => t.position >= taskToDelete.position && t.status === taskToDelete.status)
            if (idx === -1) return [...prev, taskToDelete]
            const next = [...prev]
            next.splice(idx, 0, taskToDelete)
            return next
          })
          supabase.from('tasks').update({ deleted_at: null }).eq('id', id).then()
        },
      },
      duration: 4000,
    })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className="kanban-scroll"
        style={{
          display: 'flex', gap: 12, padding: '0 20px 20px',
          overflowX: 'auto', flex: 1,
          touchAction: 'pan-x',
        }}
      >
        <AnimatePresence>
          {COLUMNS.map((id) => (
            <KanbanColumn
              key={id}
              id={id}
              tasks={grouped[id] || []}
              loading={loading}
              onEdit={setEditingTask}
              onNewTask={() => setCreatingColumn(id)}
            />
          ))}
        </AnimatePresence>
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
        {activeTask ? <TaskCardDragClone task={activeTask} /> : null}
      </DragOverlay>

      <AnimatePresence>
        {creatingColumn && (
          <TaskModal
            key="create"
            mode="create"
            onClose={() => setCreatingColumn(null)}
            onSave={(payload) => handleCreate(creatingColumn, payload)}
          />
        )}
        {editingTask && (
          <TaskModal
            key="edit"
            mode="edit"
            task={editingTask}
            onClose={() => setEditingTask(null)}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </DndContext>
  )
}
