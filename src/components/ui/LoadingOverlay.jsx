import { AnimatePresence, motion } from 'framer-motion'

export function LoadingOverlay({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'absolute', inset: 0, zIndex: 50,
            background: 'var(--glass-overlay)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 20, textAlign: 'center', padding: 40,
          }}
        >
          <motion.div
            className="animate-blob-morph"
            style={{
              width: 84, height: 84,
              background: 'linear-gradient(135deg, hsl(var(--brand)), #FF6F52)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 32,
            }}
          >
            ✦
          </motion.div>

          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#1A1530', marginBottom: 6 }}>
              Organizando suas tarefas...
            </div>
            <div style={{ fontSize: 13, color: '#5E5878' }}>
              A IA está lendo e classificando tudo
            </div>
          </div>

          <div style={{ width: 160, height: 3, background: 'hsl(var(--brand) / 0.12)', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              style={{ height: '100%', background: 'linear-gradient(90deg, hsl(var(--brand)), #FF6F52)', borderRadius: 2 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
