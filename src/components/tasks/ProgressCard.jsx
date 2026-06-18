// src/components/tasks/ProgressCard.jsx
//
// O crop "cintura pra cima" deste mascote foi MEDIDO E TESTADO
// visualmente (não calculado em teoria) nos valores abaixo:
//
//   width da imagem completa: 210px
//   altura total da imagem completa nesse width: 140px (aspect ratio do viewBox = 2048/1365)
//   altura do container (crop): 84px = 60% de 140px
//
// Esses 60% foram escolhidos comparando visualmente várias opções
// (45% a 70%) e é o ponto exato em que a linha de corte passa logo
// abaixo dos cotovelos/mãos na cintura, mostrando os braços completos
// sem cortar de forma estranha.
//
// NÃO ALTERE o width=210 sem recalcular a altura do container.
// Se precisar de outro tamanho, a fórmula é:
//   alturaContainer = (novoWidth / 1.5003) * 0.60
// (1.5003 = 2048/1365, o aspect ratio do viewBox do arquivo mascote-kanban.svg)

import { motion } from 'framer-motion'
import Mascot from '../ui/Mascot'

const MASCOT_WIDTH = 210
const MASCOT_CROP_HEIGHT = 84 // = (210 / 1.5003) * 0.60

export function ProgressCard({ tasks }) {
  const done = tasks.filter((t) => t.status === 'feito').length
  const total = tasks.length

  return (
    <div
      className="rounded-[26px] relative overflow-hidden flex items-end"
      style={{
        minHeight: 140,
        background: 'linear-gradient(135deg, rgba(91,61,242,0.88), rgba(68,39,214,0.92))',
        boxShadow: '0 10px 28px rgba(91,61,242,0.28)',
      }}
    >
      {/* blob decorativo interno */}
      <div
        className="absolute -top-[35px] -right-[25px]"
        style={{
          width: 110,
          height: 110,
          background: 'rgba(255,255,255,0.14)',
          borderRadius: '45% 55% 50% 50% / 55% 45% 55% 45%',
        }}
      />

      <div className="relative z-10 flex-1 py-[18px] pl-5 pb-4">
        <div className="flex items-baseline gap-2">
          <motion.span
            key={done}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[40px] font-extrabold text-white tracking-tight leading-none"
          >
            {done}
          </motion.span>
          <span className="text-[12.5px] text-white/75 font-semibold pb-1">
            de {total}
          </span>
        </div>
        <div className="text-[11px] text-white/60 font-semibold mt-0.5">
          feitas hoje 🔥
        </div>
      </div>

      {/* ── Container de crop: ESTA altura fixa (84px) menor que a
          imagem completa (140px) é o que produz o corte. O overflow
          hidden esconde tudo que está abaixo dessa altura. ── */}
      <div
        className="relative z-10 flex-shrink-0 flex items-start justify-center self-end"
        style={{
          width: MASCOT_WIDTH,
          height: MASCOT_CROP_HEIGHT,
          overflow: 'hidden',
        }}
      >
        <Mascot pose="kanban" width={MASCOT_WIDTH} />
      </div>
    </div>
  )
}
