import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import { DndContext, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { KanbanColumn } from './KanbanColumn'
import { TaskEditSheet } from './TaskEditSheet'
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
  const [editingTask, setEditingTask] = useState(null)
  const pendingDeleteRef = useRef(null)
  const tempIdRef = useRef(0)
  const grouped = groupByStatus(tasks)

  async function handleDragEnd(event) {
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
      if (targetStatus === activeTask.status) return

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

  async function handleCreate(columnStatus, { title, priority }) {
    const tempId = `temp-${++tempIdRef.current}`
    const tempTask = {
      id: tempId,
      title,
      priority,
      status: columnStatus,
      position: grouped[columnStatus].length,
    }
    onTasksChange([...tasks, tempTask])

    const { data, error } = await supabase
      .from('tasks')
      .insert({ title, priority, status: columnStatus, position: grouped[columnStatus].length })
      .select()
      .single()

    if (error || !data) {
      onTasksChange(tasks.filter((t) => t.id !== tempId))
      toast.error('Algo deu errado. Tente novamente.')
    } else {
      onTasksChange((prev) => prev.map((t) => (t.id === tempId ? data : t)))
    }
  }

  async function handleSave({ id, title, priority }) {
    const prevTasks = tasks
    onTasksChange(tasks.map((t) => (t.id === id ? { ...t, title, priority } : t)))

    const { error } = await supabase.from('tasks').update({ title, priority }).eq('id', id)
    if (error) {
      onTasksChange(prevTasks)
      toast.error('Algo deu errado. Tente novamente.')
    }
  }

  function handleDelete(id) {
    const taskToDelete = tasks.find((t) => t.id === id)
    if (!taskToDelete) return

    if (pendingDeleteRef.current) {
      clearTimeout(pendingDeleteRef.current.timeout)
      supabase.from('tasks').update({ deleted_at: new Date().toISOString() }).eq('id', pendingDeleteRef.current.id)
      pendingDeleteRef.current = null
    }

    onTasksChange(tasks.filter((t) => t.id !== id))

    pendingDeleteRef.current = {
      id,
      task: taskToDelete,
      timeout: setTimeout(async () => {
        await supabase.from('tasks').update({ deleted_at: new Date().toISOString() }).eq('id', id)
        pendingDeleteRef.current = null
      }, 4000),
    }

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
        },
      },
      duration: 4000,
    })
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
              onEdit={setEditingTask}
              onCreateTask={(payload) => handleCreate(id, payload)}
            />
          ))}
        </AnimatePresence>
      </div>

      {editingTask && (
        <TaskEditSheet
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </DndContext>
  )
}
