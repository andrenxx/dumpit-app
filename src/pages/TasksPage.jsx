import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'
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
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .is('deleted_at', null)
        .order('position', { ascending: true })

      if (!active) return
      if (error) toast.error('Algo deu errado. Tente novamente.')
      else setTasks(data || [])
      setLoading(false)
    }

    fetchTasks()
    return () => { active = false }
  }, [])

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-shrink-0 px-5 pt-1 pb-3.5 lg:px-10 lg:pt-10 lg:pb-6 lg:flex lg:items-end lg:justify-between lg:gap-8">
        <div className="mb-3.5 lg:mb-0">
          <h1 className="text-title lg:text-display font-bold text-text-primary">Tarefas</h1>
          <div className="text-label lg:text-body text-text-secondary mt-0.5 tabular-nums">
            {tasks.length} tarefa{tasks.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="lg:w-[400px] flex-shrink-0">
          <ProgressCard tasks={tasks} />
        </div>
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
