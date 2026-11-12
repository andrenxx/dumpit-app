import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

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
            className="surface rounded-[20px] flex items-start gap-3"
            style={{ padding: '14px 16px' }}
          >
            <Sparkles size={18} className="flex-shrink-0 mt-0.5 text-brand" />
            <div>
              <strong className="text-label font-semibold block mb-1">
                Você já usou seu crédito gratuito
              </strong>
              <p className="text-meta text-text-secondary leading-relaxed">
                A IA é paga. O Kanban manual é pra sempre grátis.<br />
                R$25/mês pra continuar usando a IA.
              </p>
              <button
                className="mt-2.5 px-4 py-2 rounded-[10px] text-label font-medium text-white bg-action hover:bg-action-hover"
                style={{ border: 'none', cursor: 'pointer' }}
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
