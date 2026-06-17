import { AnimatePresence, motion } from 'framer-motion'

export function LoadingOverlay({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute', inset: 0, zIndex: 50, background: 'var(--bg-app)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 16, textAlign: 'center', padding: 40,
          }}
        >
          <div style={{
            width: 36, height: 36, border: '2px solid #F0ECE6',
            borderTopColor: 'var(--brand)', borderRadius: '50%',
            animation: 'dumpit-spin 0.8s linear infinite',
          }} />
          <style>{'@keyframes dumpit-spin { to { transform: rotate(360deg); } }'}</style>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>
            Organizando suas tarefas...
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            A IA está lendo e classificando tudo
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
