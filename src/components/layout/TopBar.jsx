import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'

function getInitial(email) {
  return email ? email[0].toUpperCase() : ''
}

export function TopBar() {
  const { user, signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="glass-surface sticky top-0 z-20 flex items-center justify-between px-5 py-3 border-b border-white/40 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-[17px] font-medium tracking-tight text-text-primary">
          dump
          <span className="px-[7px] py-[2px] rounded-[9px] bg-brand/[0.07] border border-brand/[0.12] backdrop-blur-xs text-brand text-[15px]">
            it
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(145deg, #FF6F52, #FFA988)',
            boxShadow: '0 3px 10px rgba(255,111,82,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600, color: '#fff',
            border: 'none', cursor: 'pointer',
          }}
        >
          {getInitial(user?.email)}
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
              style={{ background: 'rgba(15,10,40,0.18)', backdropFilter: 'blur(2px)' }}
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
                background: 'var(--glass-bg-strong)',
                backdropFilter: 'blur(32px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(32px) saturate(1.8)',
                borderLeft: '1px solid var(--glass-border)',
                boxShadow: '-8px 0 40px hsl(var(--brand) / 0.10)',
              }}
            >
              <div
                className="flex items-center justify-between px-5 pt-14 pb-5"
                style={{ borderBottom: '1px solid hsl(var(--brand) / 0.07)' }}
              >
                <div>
                  <div className="text-[13px] font-bold text-text-primary">Perfil</div>
                  <div className="text-[11px] text-text-secondary mt-0.5 truncate" style={{ maxWidth: 180 }}>
                    {user?.email}
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  style={{ fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', lineHeight: 1 }}
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 px-4 py-5">
                <button
                  onClick={toggle}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-[16px] mb-2"
                  style={{
                    background: 'hsl(var(--brand) / 0.06)',
                    border: '1px solid hsl(var(--brand) / 0.10)',
                    color: 'hsl(var(--text-primary))',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span style={{ fontSize: 15 }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
                    {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
                  </span>
                  <span style={{ opacity: 0.4, fontSize: 11 }}>
                    {theme === 'dark' ? 'ativo: escuro' : 'ativo: claro'}
                  </span>
                </button>

                <button
                  onClick={async () => { setOpen(false); await signOut() }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-[16px] text-left"
                  style={{
                    background: 'rgba(255,100,80,0.07)',
                    border: '1px solid rgba(255,100,80,0.14)',
                    color: '#D93B22',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 15 }}>↪</span>
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
