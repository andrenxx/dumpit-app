import { motion } from 'framer-motion'
import Mascot from '../ui/Mascot'

export function ProgressCard({ tasks }) {
  const done = tasks.filter((t) => t.status === 'feito').length
  const total = tasks.length

  return (
    <div
      className="rounded-[26px] relative overflow-hidden flex items-end mb-3 flex-shrink-0"
      style={{
        background: 'linear-gradient(135deg, rgba(91,61,242,0.88), rgba(68,39,214,0.92))',
        boxShadow: '0 10px 28px rgba(91,61,242,0.28)',
        minHeight: 140,
      }}
    >
      {/* blob decorativo interno */}
      <div
        className="absolute bg-white/[0.14] rounded-[45%_55%_50%_50%/55%_45%_55%_45%]"
        style={{ width: 110, height: 110, top: -35, right: -25 }}
      />

      <div className="relative flex-1 py-[18px] pl-5 pb-4" style={{ zIndex: 2 }}>
        <div className="flex items-baseline gap-2">
          <motion.span
            key={done}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-[40px] font-extrabold text-white tracking-tight leading-none"
          >
            {done}
          </motion.span>
          <span className="text-[12.5px] font-semibold pb-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
            de {total}
          </span>
        </div>
        <div className="text-[11px] font-semibold mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
          feitas hoje 🔥
        </div>
      </div>

      <div
        className="relative flex-shrink-0 self-end overflow-hidden"
        style={{ zIndex: 2, width: 118, height: 132 }}
      >
        <img
          src="/mascote/mascote-kanban.svg"
          alt=""
          style={{
            width: 180,
            height: 240,
            position: 'absolute',
            top: 0,
            left: -24,
          }}
        />
      </div>
    </div>
  )
}
