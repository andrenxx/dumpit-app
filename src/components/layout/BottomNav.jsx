import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, LayoutList } from 'lucide-react'

const items = [
  { to: '/dashboard/dump',    Icon: Sparkles,   label: 'Dump' },
  { to: '/dashboard/tarefas', Icon: LayoutList, label: 'Tarefas' },
]

export function BottomNav() {
  return (
    <div className="flex justify-center pb-5 pt-2 flex-shrink-0 lg:hidden">
      <div className="surface-raised flex rounded-[26px] p-1.5 gap-1">
        {items.map(({ to, Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="relative flex flex-col items-center justify-center gap-1 px-8 py-2.5 rounded-[20px] text-meta font-medium transition-colors"
            style={{ minWidth: 90 }}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-[20px] bg-action"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={18} className="relative z-10" style={{ color: isActive ? '#fff' : 'hsl(var(--text-secondary))' }} />
                <span className="relative z-10" style={{ color: isActive ? '#fff' : 'hsl(var(--text-secondary))' }}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  )
}
