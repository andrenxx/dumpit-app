import { TaskCard } from './TaskCard'
import { NewTaskButton } from './NewTaskButton'

export function KanbanColumn({ dotColor, label, tasks }) {
  return (
    <div style={{
      minWidth: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 13px', background: 'var(--bg-card)',
        border: '0.5px solid var(--border-default)', borderRadius: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
        </div>
        <span style={{
          fontSize: 11, padding: '1px 7px', borderRadius: 20,
          background: '#F0ECE6', color: 'var(--text-hint)',
        }}>
          {tasks.length}
        </span>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: 7,
        flex: 1, overflowY: 'auto', padding: 1, minHeight: 60,
      }}>
        {tasks.map((task) => <TaskCard key={task.id} task={task} />)}
        <NewTaskButton />
      </div>
    </div>
  )
}
