import Mascot from '../ui/Mascot'

const EXAMPLE_TEXT = 'Preciso entregar o relatório pro cliente hoje, reunião amanhã às 9h, ' +
  'ligar pro fornecedor essa semana, comprar café e pagar a conta de luz antes de sexta'

export function ExampleCard({ onFill }) {
  return (
    <div
      onClick={() => onFill(EXAMPLE_TEXT)}
      className="glass-surface-strong rounded-[22px] flex items-end cursor-pointer overflow-hidden"
      style={{ minHeight: 108, boxShadow: '0 4px 16px rgba(91,61,242,0.06)' }}
    >
      <div
        className="relative flex-shrink-0 flex items-end justify-center self-end ml-1.5"
        style={{ zIndex: 2, width: 84 }}
      >
        <Mascot pose="dump" style={{ width: 108, height: 'auto' }} />
      </div>

      <div className="relative flex-1 py-3.5 pr-4 pl-1.5" style={{ zIndex: 2 }}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[10px] font-bold text-text-hint uppercase tracking-wide">
            💡 clique pra testar
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,210,160,0.16)', color: '#1A8A6C' }}
          >
            exemplo
          </span>
        </div>
        <p className="text-[12px] text-text-primary font-semibold leading-snug">
          &ldquo;Preciso entregar o relatório pro cliente hoje, reunião amanhã
          às 9h, ligar pro fornecedor essa semana, comprar café e pagar
          a conta de luz antes de sexta&rdquo;
        </p>
      </div>
    </div>
  )
}
