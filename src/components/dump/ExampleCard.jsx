// src/components/dump/ExampleCard.jsx
//
// mascote-dump.svg: viewBox 1536×1024, aspect ratio 1.5.
//
// Crop strategy: the card's own overflow:hidden (rounded-[22px]) clips the
// mascot at the bottom. The inner container is narrower than MASCOT_WIDTH so
// the image bleeds left/right; marginLeft pulls the character into frame and
// marginBottom (negative) pushes the feet below the card edge so the card's
// rounded corner does the natural bottom crop — no separate overflow:hidden needed.
//
// To adjust the crop point: change marginBottom. More negative = higher crop.
// To adjust character size: change MASCOT_WIDTH (container width is independent).

import Mascot from '../ui/Mascot'

const MASCOT_WIDTH = 230          // rendered image width
const MASCOT_CONTAINER_WIDTH = 110 // visible window width (narrower than image)

export function ExampleCard({ onFill }) {
  return (
    <div
      onClick={onFill}
      className="rounded-[22px] flex items-end cursor-pointer overflow-hidden"
      style={{
        minHeight: 108,
        background: 'var(--glass-bg-strong)',
        backdropFilter: 'blur(20px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 4px 16px hsl(var(--brand) / 0.06)',
      }}
    >
      <div
        className="flex-shrink-0 flex items-start justify-center self-end"
        style={{ width: MASCOT_CONTAINER_WIDTH, marginLeft: -12, marginBottom: -45 }}
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
