import { motion } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Badge } from '../ui/Badge'
import { Card, CardContent } from '../ui/card'

const priorityToBadge = {
  alta: 'urgente',
  media: 'normal',
  baixa: 'depois',
}

export function TaskCard({ task }) {
  const done = task.status === 'feito'
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
    userSelect: 'none',
    opacity: isDragging ? 0.35 : (done ? 0.5 : 1),
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Card
        ref={setNodeRef}
        style={dndStyle}
        {...attributes}
        {...listeners}
        className="border-[0.5px] border-[var(--border-default)] hover:border-[var(--brand-hover)]"
      >
        <CardContent>
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
        </CardContent>
      </Card>
    </motion.div>
  )
}
