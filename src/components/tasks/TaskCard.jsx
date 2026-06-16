import { Badge } from '../ui/Badge'

const priorityToBadge = {
  alta: 'urgente',
  media: 'normal',
  baixa: 'depois',
}

export function TaskCard({ task }) {
  const done = task.status === 'feito'

  return (
    <div style={{
      background: 'var(--bg-card)', border: '0.5px solid var(--border-default)',
      borderRadius: 16, padding: '13px 15px', cursor: 'grab',
      transition: 'border-color 0.18s', userSelect: 'none',
      opacity: done ? 0.5 : 1,
    }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand-hover)' }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)' }}
    >
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 8, marginBottom: 10,
      }}>
        <span style={{
          fontSize: 13, fontWeight: 500, lineHeight: 1.4, flex: 1,
          textDecoration: done ? 'line-through' : 'none',
          color: done ? 'var(--text-hint)' : 'var(--text-primary)',
        }}>
          {task.title}
        </span>
        <span style={{ color: 'var(--text-hint)', fontSize: 11, flexShrink: 0, paddingTop: 2 }}>✎</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Badge variant={priorityToBadge[task.priority] || 'normal'} />
        <span style={{ color: 'var(--text-hint)', fontSize: 13 }}>⠿</span>
      </div>
    </div>
  )
}
