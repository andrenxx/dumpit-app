import { motion } from 'framer-motion'

const EXAMPLE_TEXT = 'Preciso entregar o relatório pro cliente hoje, reunião amanhã às 9h, ' +
  'ligar pro fornecedor essa semana, comprar café e pagar a conta de luz antes de sexta'

export function ExampleCard({ onFill }) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onFill(EXAMPLE_TEXT)}
      className="glass-surface rounded-[20px] cursor-pointer"
      style={{ padding: '14px 16px', boxShadow: '0 3px 12px rgba(91,61,242,0.06)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-semibold tracking-wider text-text-hint uppercase">
          💡 Clique pra testar
        </span>
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(0,210,160,0.16)', color: '#1A8A6C' }}
        >
          exemplo
        </span>
      </div>
      <p className="text-[13px] text-text-secondary leading-relaxed">
        &ldquo;{EXAMPLE_TEXT}&rdquo;
      </p>
    </motion.div>
  )
}
