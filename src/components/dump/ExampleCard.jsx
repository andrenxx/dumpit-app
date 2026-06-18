// src/components/dump/ExampleCard.jsx
//
// mascote-dump.svg: viewBox 1536×1024, aspect ratio 1.5.
// Crop "cintura pra cima" igual ao ProgressCard:
//   width=120 → altura total = 120/1.5 = 80px
//   crop height = 80 × 0.60 = 48px (mostra cabeça + prancheta)
// IMPORTANTE: container width DEVE ser igual a MASCOT_WIDTH.
// Se forem diferentes, o flex encolhe a imagem e o crop não funciona.
// NÃO ALTERE MASCOT_WIDTH sem recalcular MASCOT_CROP_HEIGHT.
// Fórmula: MASCOT_CROP_HEIGHT = (MASCOT_WIDTH / 1.5) * 0.60

import Mascot from '../ui/Mascot'

const MASCOT_WIDTH = 120
const MASCOT_CROP_HEIGHT = 48 // = (120 / 1.5) * 0.60

export function ExampleCard({ onFill }) {
  return (
    <div
      onClick={onFill}
      className="rounded-[22px] flex items-end cursor-pointer overflow-hidden"
      style={{
        minHeight: 108,
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(20px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
        border: '1px solid rgba(255,255,255,0.8)',
        boxShadow: '0 4px 16px rgba(91,61,242,0.06)',
      }}
    >
      <div
        className="flex-shrink-0 flex items-start justify-center self-end ml-1.5"
        style={{ width: MASCOT_WIDTH, height: MASCOT_CROP_HEIGHT, overflow: 'hidden' }}
      >
        <Mascot pose="dump" width={MASCOT_WIDTH} />
      </div>

      <div className="flex-1 py-3.5 pr-4 pl-1.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[10px] font-bold text-text-hint uppercase tracking-wide">
            💡 clique pra testar
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ color: '#1A8A6C', background: 'rgba(0,210,160,0.16)' }}
          >
            exemplo
          </span>
        </div>
        <p className="text-[12px] text-text-primary font-semibold leading-snug">
          "Preciso entregar o relatório pro cliente hoje, reunião amanhã
          às 9h, ligar pro fornecedor essa semana, comprar café e pagar
          a conta de luz antes de sexta"
        </p>
      </div>
    </div>
  )
}
