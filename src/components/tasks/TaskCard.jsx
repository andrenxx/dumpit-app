import { useEffect, useRef } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ShadcnBadge } from '../ui/shadcn-badge'

const PRIORITY_CLASS = {
  alta:  'bg-coral/[0.22] text-[#C24A33] border-0',
  media: 'bg-yellow/[0.28] text-[#8A6418] border-0',
  baixa: 'bg-mint/[0.16] text-[#1A8A6C] border-0',
}

const PRIORITY_LABEL = { alta: 'Alta', media: 'Média', baixa: 'Baixa' }

export function TaskCard({ task }) {
  const done = task.status === 'feito'
  const controls = useAnimationControls()
  const mounted = useRef(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    if (done) {
      controls.start({ scale: [1, 1.06, 1], transition: { duration: 0.3 } })
    }
  }, [done, controls])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <motion.div
        ref={setNodeRef}
        animate={controls}
        whileHover={!isDragging ? { y: -2 } : {}}
        layout={!isDragging}
        className="glass-surface-strong glass-inset-highlight rounded-[20px] shadow-glass-sm"
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          cursor: 'grab',
          userSelect: 'none',
          opacity: isDragging ? 0.35 : 1,
          padding: '12px 14px',
        }}
        {...attributes}
        {...listeners}
      >
        <div style={{
          fontSize: 13,
          fontWeight: 500,
          lineHeight: 1.45,
          color: done ? '#ACA4C8' : '#1A1530',
          textDecoration: done ? 'line-through' : 'none',
          marginBottom: 10,
        }}>
          {task.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <ShadcnBadge className={PRIORITY_CLASS[task.priority] || PRIORITY_CLASS.media}>
            {PRIORITY_LABEL[task.priority] || task.priority}
          </ShadcnBadge>
          <span style={{ color: '#ACA4C8', fontSize: 13, lineHeight: 1 }}>⠿</span>
        </div>
      </motion.div>
    </motion.div>
  )
}
