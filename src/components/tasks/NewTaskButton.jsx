import { motion } from 'framer-motion'

export function NewTaskButton({ onNewTask }) {
  return (
    <motion.button
      whileHover={{ borderColor: 'hsl(var(--brand))', color: 'hsl(var(--brand))' }}
      whileTap={{ scale: 0.98 }}
      onClick={onNewTask}
      className="w-full flex items-center justify-center gap-1.5 rounded-[14px] text-meta font-medium text-text-secondary cursor-pointer flex-shrink-0"
      style={{
        padding: 11,
        border: '1px dashed hsl(var(--border-strong))',
        background: 'hsl(var(--surface))',
      }}
    >
      <span className="text-brand text-body">+</span> Nova task
    </motion.button>
  )
}
