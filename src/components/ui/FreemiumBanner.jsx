import { AnimatePresence, motion } from 'framer-motion'

export function FreemiumBanner({ visible = true }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{ overflow: 'hidden' }}
        >
          <div
            className="glass-surface rounded-[20px] flex items-start gap-3"
            style={{ padding: '14px 16px', background: 'rgba(255,111,82,0.08)' }}
          >
            <div className="text-[18px] flex-shrink-0 pt-0.5">✦</div>
            <div>
              <strong className="text-[13px] font-medium block mb-1">
                Você já usou seu crédito gratuito
              </strong>
              <p className="text-[12px] text-text-secondary leading-relaxed">
                A IA é paga. O Kanban manual é pra sempre grátis.<br />
                R$25/mês pra continuar usando a IA.
              </p>
              <button
                className="mt-2.5 px-4 py-2 rounded-[10px] text-[12px] font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #5B3DF2, #4427D6)', border: 'none', cursor: 'pointer' }}
              >
                Assinar plano pago
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
