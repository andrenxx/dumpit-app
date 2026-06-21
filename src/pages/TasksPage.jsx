import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { KanbanBoard } from '../components/tasks/KanbanBoard'
import { ProgressCard } from '../components/tasks/ProgressCard'

export function TasksPage() {
  const { user } = useAuth()
  const location = useLocation()
  const seedTasks = location.state?.tasks
  const [tasks, setTasks] = useState(seedTasks ?? [])
  const [loading, setLoading] = useState(!seedTasks)

  useEffect(() => {
    let active = true

    async function fetchTasks() {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .is('deleted_at', null)
        .order('position', { ascending: true })

      if (active) {
        setTasks(data || [])
        setLoading(false)
      }
    }

    fetchTasks()
    return () => { active = false }
  }, [])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '4px 20px 14px', flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'hsl(var(--text-primary))' }}>Tarefas</div>
        <div style={{ fontSize: 11, color: 'hsl(var(--text-hint))', marginTop: 2 }}>
          {tasks.length} tarefa{tasks.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div style={{ padding: '0 20px 16px', flexShrink: 0 }}>
        <ProgressCard tasks={tasks} />
      </div>
      <KanbanBoard
        tasks={tasks}
        onTasksChange={setTasks}
        loading={loading}
        user={user}
      />
    </div>
  )
}
