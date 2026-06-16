import { KanbanColumn } from './KanbanColumn'

const COLUMNS = [
  { id: 'a_fazer', dotColor: '#C8BAB0', label: 'A fazer' },
  { id: 'fazendo', dotColor: '#F59E0B', label: 'Fazendo' },
  { id: 'feito', dotColor: '#22C55E', label: 'Feito' },
]

export function KanbanBoard({ grouped }) {
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '0 20px 20px',
      overflowX: 'auto', flex: 1,
    }}>
      {COLUMNS.map((col) => (
        <KanbanColumn
          key={col.id}
          dotColor={col.dotColor}
          label={col.label}
          tasks={grouped[col.id] || []}
        />
      ))}
    </div>
  )
}
