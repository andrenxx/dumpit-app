// src/components/tasks/ProgressCard.jsx
//
// mascote-kanban.svg: viewBox 2048×1365, aspect ratio 1.5003.
//
// Crop strategy: fixed-height container (overflow:hidden) clips the bottom.
// Container width equals MASCOT_WIDTH so flex doesn't shrink the image.
// marginRight (negative) shifts the character further right so it bleeds
// out of the card; the card's overflow:hidden rounds the crop edge.
//
// MASCOT_CROP_HEIGHT = (MASCOT_WIDTH / 1.5003) * 0.60 — tested visually.

import { motion } from 'framer-motion'
import Mascot from '../ui/Mascot'

const MASCOT_WIDTH = 250
const MASCOT_CROP_HEIGHT = 100 // = (250 / 1.5003) * 0.60

export function ProgressCard({ tasks }) {
  const done = tasks.filter((t) => t.status === 'feito').length
  const total = tasks.length

  return (
    <div
      className="rounded-[26px] relative overflow-hidden flex items-end"
      style={{
        minHeight: 140,
        background: 'linear-gradient(135deg, hsl(var(--brand) / 0.88), hsl(var(--brand-deep) / 0.92))',
        boxShadow: '0 10px 28px var(--shadow-brand-card)',
      }}
    >
      <div
        className="absolute -top-[35px] -right-[25px]"
        style={{
          width: 110,
          height: 110,
          background: 'rgba(255,255,255,0.14)',
          borderRadius: '45% 55% 50% 50% / 55% 45% 55% 45%',
        }}
      />

      <div className="relative z-10 flex-1 py-[18px] pl-5 pb-4">
        <div className="flex items-baseline gap-2">
          <motion.span
            key={done}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[40px] font-extrabold text-white tracking-tight leading-none"
          >
            {done}
          </motion.span>
          <span className="text-[12.5px] text-white/75 font-semibold pb-1">
            de {total}
          </span>
        </div>
        <div className="text-[11px] text-white/60 font-semibold mt-0.5">
          feitas hoje 🔥
        </div>
      </div>

      <div
        className="relative z-10 flex-shrink-0 flex items-start justify-center self-end"
        style={{
          width: MASCOT_WIDTH,
          height: MASCOT_CROP_HEIGHT,
          overflow: 'hidden',
          marginRight: -60,
        }}
      >
        <Mascot pose="kanban" width={MASCOT_WIDTH} />
      </div>
    </div>
  )
}
