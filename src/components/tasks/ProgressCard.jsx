import { motion } from 'framer-motion'

export function ProgressCard({ tasks }) {
  const done = tasks.filter((t) => t.status === 'feito').length
  const total = tasks.length

  return (
    <div
      className="rounded-[20px] px-5 py-4 mb-3 flex-shrink-0"
      style={{
        background: 'linear-gradient(135deg, rgba(91,61,242,0.82), rgba(68,39,214,0.85))',
        boxShadow: '0 8px 24px rgba(91,61,242,0.22)',
      }}
    >
      <div className="text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
        Progresso
      </div>
      <div className="flex items-baseline gap-1.5">
        <motion.span
          key={done}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-[28px] font-bold text-white leading-none"
        >
          {done}
        </motion.span>
        <span className="text-[14px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
          / {total} concluídas
        </span>
      </div>
    </div>
  )
}
