import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { KanbanBoard } from '../components/tasks/KanbanBoard'

const COLUMN_IDS = ['a_fazer', 'fazendo', 'feito']

function groupByStatus(tasks) {
  return COLUMN_IDS.reduce((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status)
    return acc
  }, {})
}

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

  const grouped = groupByStatus(tasks)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '4px 20px 14px', flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Tarefas</div>
        <div style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 2 }}>
          {tasks.length} tarefa{tasks.length !== 1 ? 's' : ''}
        </div>
      </div>

      {loading ? <SkeletonBoard /> : <KanbanBoard grouped={grouped} />}
    </div>
  )
}
