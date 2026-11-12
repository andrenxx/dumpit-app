import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const COLUMN_X = [0, 56, 112]
const NOTES = [
  { col: 0, row: 0, w: 44, from: { x: 70, y: -34, r: -14 } },
  { col: 1, row: 0, w: 38, from: { x: -52, y: 22, r: 11 } },
  { col: 2, row: 0, w: 44, from: { x: 34, y: 46, r: -8 } },
  { col: 0, row: 1, w: 34, from: { x: 96, y: 18, r: 16 } },
  { col: 1, row: 1, w: 44, from: { x: -20, y: -40, r: -12 } },
  { col: 2, row: 1, w: 30, from: { x: -80, y: 30, r: 9 } },
]

function SortingNotes() {
  const reduce = useReducedMotion()
  return (
    <div style={{ position: 'relative', width: 156, height: 84 }} aria-hidden="true">
      {COLUMN_X.map((x) => (
        <div
          key={x}
          style={{
            position: 'absolute', left: x, top: 0, width: 44, height: 84,
            borderRadius: 10, background: 'hsl(var(--surface-sunken))',
            border: '1px solid hsl(var(--border-default))',
          }}
        />
      ))}
      {NOTES.map((n, i) => {
        const tx = COLUMN_X[n.col] + 4
        const ty = 8 + n.row * 22
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute', left: 0, top: 0, height: 16, width: n.w - 8,
              borderRadius: 5, background: 'hsl(var(--surface))',
              border: '1px solid hsl(var(--border-strong))',
            }}
            initial={false}
            animate={reduce
              ? { x: tx, y: ty, rotate: 0 }
              : {
                  x: [tx + n.from.x, tx, tx, tx + n.from.x],
                  y: [ty + n.from.y, ty, ty, ty + n.from.y],
                  rotate: [n.from.r, 0, 0, n.from.r],
                }}
            transition={reduce
              ? { duration: 0 }
              : { duration: 2.6, times: [0, 0.45, 0.8, 1], ease: 'easeOut', repeat: Infinity, delay: i * 0.08 }}
          />
        )
      })}
    </div>
  )
}

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
            background: 'hsl(var(--bg-app) / 0.94)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 24, textAlign: 'center', padding: 40,
          }}
        >
          <SortingNotes />

          <div>
            <div style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'hsl(var(--text-primary))', marginBottom: 6 }}>
              Organizando suas tarefas...
            </div>
            <div style={{ fontSize: 'var(--fs-label)', color: 'hsl(var(--text-secondary))' }}>
              A IA está lendo e classificando tudo
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
