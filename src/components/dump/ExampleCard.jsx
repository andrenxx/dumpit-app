// src/components/dump/ExampleCard.jsx
//
// O mascote-dump.svg tem aspect ratio 1.5 (viewBox 1536x1024).
// Em width=108px, a imagem completa renderiza com ~72px de altura.
// O card tem minHeight=108px, então a imagem (72px de altura) cabe
// INTEIRA dentro do card verticalmente — não há corte vertical aqui,
// diferente do ProgressCard. O efeito de "canto entrando no card" é
// só de posicionamento horizontal (mascote ancorado à esquerda).
//
// ⚠️ Este SVG específico tem FUNDO BRANCO OPACO (não transparente,
// diferente dos outros dois arquivos). Se aparecer um quadrado/retângulo
// branco visível atrás do personagem dentro do card, é esse fundo —
// nesse caso, seria necessário pedir uma nova exportação do SVG com
// fundo transparente, ou aplicar um recorte de máscara via CSS
// (mix-blend-mode não resolve fundo opaco; precisa do SVG correto).

import Mascot from '../ui/Mascot'

const MASCOT_WIDTH = 108

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
        className="flex-shrink-0 flex items-end justify-center self-end ml-1.5"
        style={{ width: 84 }}
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
