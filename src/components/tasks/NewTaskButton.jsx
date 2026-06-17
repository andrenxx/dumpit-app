import { motion } from 'framer-motion'

export function NewTaskButton() {
  return (
    <motion.button
      whileHover={{ borderColor: '#5B3DF2', color: '#5B3DF2' }}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center justify-center gap-1.5 glass-surface rounded-[14px] text-[12px] font-medium text-text-hint cursor-pointer flex-shrink-0"
      style={{
        padding: 11,
        border: '1px dashed rgba(91,61,242,0.25)',
        background: 'rgba(255,255,255,0.45)',
      }}
    >
      <span className="text-brand text-[15px]">+</span> Nova task
    </motion.button>
  )
}
