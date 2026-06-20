import { useEffect, useRef } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { ShadcnBadge } from '../ui/shadcn-badge'

const PRIORITY_CLASS = {
  alta:  'bg-coral/[0.22] text-[#C24A33] border-0',
  media: 'bg-yellow/[0.28] text-[#8A6418] border-0',
  baixa: 'bg-mint/[0.16] text-[#1A8A6C] border-0',
}

const PRIORITY_LABEL = { alta: 'Alta', media: 'Média', baixa: 'Baixa' }

function CardBody({ task }) {
  const done = task.status === 'feito'
  return (
    <div
      className="glass-surface-strong glass-inset-highlight rounded-[20px] shadow-glass-sm"
      style={{ padding: '12px 14px' }}
    >
      <div style={{
        fontSize: 13,
        fontWeight: 500,
        lineHeight: 1.45,
        color: done ? '#ACA4C8' : '#1A1530',
        textDecoration: done ? 'line-through' : 'none',
        marginBottom: task.description ? 6 : 10,
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
          lineHeight: 1.55,
          color: '#ACA4C8',
          marginBottom: 10,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {task.description}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <ShadcnBadge className={PRIORITY_CLASS[task.priority] || PRIORITY_CLASS.media}>
          {PRIORITY_LABEL[task.priority] || task.priority}
        </ShadcnBadge>
        <GripVertical size={14} style={{ color: '#ACA4C8', flexShrink: 0 }} />
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
