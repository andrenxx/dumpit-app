import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sun, Moon, LogOut, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { Wordmark } from '../ui/Wordmark'
import { getInitial } from '../../utils/getInitial'

function getDisplayName(user) {
  return user?.user_metadata?.name || user?.email || ''
}

export function TopBar() {
  const { user, signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="bg-bg-app sticky top-0 z-20 flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0 lg:hidden">
        <Wordmark />
        <button
          onClick={() => setOpen(true)}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'hsl(var(--action))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'var(--fs-meta)', fontWeight: 600, color: '#fff',
            border: 'none', cursor: 'pointer',
          }}
        >
          {getInitial(user)}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-30"
              style={{ background: 'hsl(var(--scrim))' }}
            />

            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 z-40 flex flex-col"
              style={{
                width: 280,
                background: 'hsl(var(--surface))',
                borderLeft: '1px solid hsl(var(--border-default))',
                boxShadow: 'var(--shadow-raised)',
              }}
            >
              <div
                className="flex items-center justify-between px-5 pt-14 pb-5"
                style={{ borderBottom: '1px solid hsl(var(--border-default))' }}
              >
                <div>
                  <div className="text-label font-semibold text-text-primary">{getDisplayName(user)}</div>
                  <div className="text-meta text-text-secondary mt-0.5 truncate" style={{ maxWidth: 180 }}>
                    {user?.email}
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-hint))', lineHeight: 1 }}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 px-4 py-5">
                <button
                  onClick={toggle}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-[16px] mb-2"
                  style={{
                    background: 'hsl(var(--surface-sunken))',
                    border: '1px solid hsl(var(--border-default))',
                    color: 'hsl(var(--text-primary))',
                    fontSize: 'var(--fs-label)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <span className="flex items-center gap-2">
                    {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                    {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
                  </span>
                  <span style={{ color: 'hsl(var(--text-hint))', fontSize: 'var(--fs-meta)' }}>
                    {theme === 'dark' ? 'ativo: escuro' : 'ativo: claro'}
                  </span>
                </button>

                <button
                  onClick={async () => {
                    setOpen(false)
                    localStorage.setItem('dumpit_show_login', '1')
                    await signOut()
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-[16px] text-left"
                  style={{
                    background: 'transparent',
                    border: '1px solid hsl(var(--border-default))',
                    color: 'hsl(var(--danger))',
                    fontSize: 'var(--fs-label)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={15} />
                  Sair
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
