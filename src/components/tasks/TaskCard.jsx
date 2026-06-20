import { useEffect, useRef } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { ShadcnBadge } from '../ui/shadcn-badge'

const PRIORITY_LABEL = { alta: 'Alta', media: 'Média', baixa: 'Baixa' }

const PRIORITY_VAR = {
  alta:  { bg: 'var(--badge-alta-bg)',   color: 'var(--badge-alta-text)'  },
  media: { bg: 'var(--badge-media-bg)',  color: 'var(--badge-media-text)' },
  baixa: { bg: 'var(--badge-baixa-bg)',  color: 'var(--badge-baixa-text)' },
}

function CardBody({ task }) {
  const done = task.status === 'feito'
  const badge = PRIORITY_VAR[task.priority] || PRIORITY_VAR.media
  return (
    <div
      className="glass-inset-highlight rounded-[20px] shadow-glass-sm"
      style={{
        padding: '12px 14px',
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
      }}
    >
      <div style={{
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1.35,
        color: done ? 'hsl(var(--text-hint))' : 'hsl(var(--text-primary))',
        textDecoration: done ? 'line-through' : 'none',
        marginBottom: task.description ? 4 : 10,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {task.title}
      </div>

      {task.description && (
        <div style={{
          fontSize: 11.5,
          fontWeight: 400,
          lineHeight: 1.4,
          color: 'hsl(var(--text-secondary))',
          marginBottom: 9,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {task.description}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <ShadcnBadge
          className="border-0"
          style={{ background: badge.bg, color: badge.color }}
        >
          {PRIORITY_LABEL[task.priority] || task.priority}
        </ShadcnBadge>
        <GripVertical size={14} style={{ color: 'hsl(var(--text-hint))', flexShrink: 0 }} />
      </div>
    </div>
  )
}

export function TaskCard({ task, onEdit }) {
  const controls = useAnimationControls()
  const mounted = useRef(false)
  const didDrag = useRef(false)
  const done = task.status === 'feito'
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    if (done) controls.start({ scale: [1, 1.06, 1], transition: { duration: 0.3 } })
  }, [done, controls])

  useEffect(() => {
    if (isDragging) didDrag.current = true
  }, [isDragging])

  function handleClick() {
    if (didDrag.current) { didDrag.current = false; return }
    onEdit?.(task)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={handleClick}
    >
      <motion.div
        ref={setNodeRef}
        animate={controls}
        whileHover={!isDragging ? { y: -2 } : {}}
        layout={!isDragging}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          cursor: 'grab',
          userSelect: 'none',
          opacity: isDragging ? 0 : 1,
        }}
        {...attributes}
        {...listeners}
      >
        <CardBody task={task} />
      </motion.div>
    </motion.div>
  )
}

export function TaskCardDragClone({ task }) {
  return (
    <div style={{ opacity: 0.92, transform: 'rotate(2deg)', cursor: 'grabbing' }}>
      <CardBody task={task} />
    </div>
  )
}
