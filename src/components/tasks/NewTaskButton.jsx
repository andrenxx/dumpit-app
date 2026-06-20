import { motion } from 'framer-motion'

export function NewTaskButton({ onNewTask }) {
  return (
    <motion.button
      whileHover={{ borderColor: 'hsl(var(--brand))', color: 'hsl(var(--brand))' }}
      whileTap={{ scale: 0.98 }}
      onClick={onNewTask}
      className="w-full flex items-center justify-center gap-1.5 glass-surface rounded-[14px] text-[12px] font-medium text-text-hint cursor-pointer flex-shrink-0"
      style={{
        padding: 11,
        border: '1px dashed hsl(var(--brand) / 0.25)',
        background: 'rgba(255,255,255,0.45)',
      }}
    >
      <span className="text-brand text-[15px]">+</span> Nova task
    </motion.button>
  )
}
