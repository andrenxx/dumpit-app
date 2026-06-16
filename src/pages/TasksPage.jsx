import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { KanbanBoard } from '../components/tasks/KanbanBoard'

const COLUMN_IDS = ['a_fazer', 'fazendo', 'feito']

function SkeletonBoard() {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '0 20px 20px', overflowX: 'auto', flex: 1 }}>
      {COLUMN_IDS.map((id) => (
        <div key={id} style={{ minWidth: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{
            height: 36, background: '#F0ECE6', borderRadius: 12,
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              height: 72, background: '#F0ECE6', borderRadius: 16,
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      ))}
      <style>{'@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }'}</style>
    </div>
  )
}

export function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorToast, setErrorToast] = useState(false)

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

  const showError = () => {
    setErrorToast(true)
    setTimeout(() => setErrorToast(false), 3000)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '4px 20px 14px', flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Tarefas</div>
        <div style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 2 }}>
          {tasks.length} tarefa{tasks.length !== 1 ? 's' : ''}
        </div>
      </div>

      {errorToast && (
        <div style={{
          margin: '0 20px 12px', background: 'var(--bg-card)',
          border: '0.5px solid rgba(184,58,36,0.2)', borderRadius: 12,
          padding: '10px 14px', fontSize: 13, color: 'var(--text-primary)',
          flexShrink: 0,
        }}>
          Algo deu errado. Tente novamente.
        </div>
      )}

      {loading
        ? <SkeletonBoard />
        : <KanbanBoard tasks={tasks} onTasksChange={setTasks} onError={showError} />}
    </div>
  )
}
