import { motion } from 'framer-motion'

const items = [
  { id: 'dump',    icon: '✦', label: 'Dump' },
  { id: 'tarefas', icon: '☰', label: 'Tarefas' },
]

export function BottomNav({ activePage, onChange }) {
  return (
    <div className="flex justify-center pb-5 pt-2 flex-shrink-0">
      <div
        className="glass-surface-strong glass-inset-highlight flex rounded-[26px] p-1.5 gap-1"
        style={{ boxShadow: '0 8px 28px hsl(var(--brand) / 0.14)' }}
      >
        {items.map((item) => {
          const active = activePage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className="relative flex flex-col items-center justify-center gap-1 px-8 py-2.5 rounded-[20px] text-xs font-medium transition-colors"
              style={{
                color: active ? '#fff' : '#ACA4C8',
                minWidth: 90,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              {active && (
                <motion.div
                  layoutId="nav-active-pill"
                  className="absolute inset-0 rounded-[20px]"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--brand)), hsl(var(--brand-deep)))' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 text-[18px] leading-none">{item.icon}</span>
              <span className="relative z-10">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
