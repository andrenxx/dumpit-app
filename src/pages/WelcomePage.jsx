import { motion, useReducedMotion } from 'framer-motion'
import Mascot from '../components/ui/Mascot'
import { Wordmark } from '../components/ui/Wordmark'

function Headline({ className = '' }) {
  return (
    <h1 className={`text-display font-bold text-text-primary ${className}`}>
      Vamos organizar<br />sua bagunça
    </h1>
  )
}

function Subline({ className = '' }) {
  return (
    <p className={`text-body text-text-secondary ${className}`} style={{ lineHeight: 1.6 }}>
      Joga tudo que tá na sua cabeça.<br />Eu cuido do resto.
    </p>
  )
}

const NOTES = [
  { text: 'Reunião amanhã às 9h',  dot: 'hsl(var(--status-doing))', top: '6%',  left: '2%',  rot: -7, dur: 5.2, delay: 0 },
  { text: 'Comprar café',          dot: 'hsl(var(--status-todo))',  top: '2%',  left: '58%', rot: 6,  dur: 4.6, delay: 0.6 },
  { text: 'Ligar pro fornecedor',  dot: 'hsl(var(--status-doing))', top: '44%', left: '-6%', rot: 5,  dur: 5.8, delay: 1.1 },
  { text: 'Pagar a conta de luz',  dot: 'hsl(var(--sticker))',      top: '78%', left: '8%',  rot: -5, dur: 4.9, delay: 0.3 },
  { text: 'Relatório pro cliente', dot: 'hsl(var(--sticker))',      top: '66%', left: '62%', rot: 8,  dur: 5.4, delay: 0.9 },
]

function NoteCloud({ reduce }) {
  return NOTES.map((n) => (
    <motion.div
      key={n.text}
      aria-hidden="true"
      className="surface-raised absolute flex items-center gap-2 rounded-[12px] px-3.5 py-2.5 text-label font-medium text-text-primary whitespace-nowrap"
      style={{ top: n.top, left: n.left, rotate: n.rot }}
      animate={reduce ? undefined : { y: [0, -8, 0] }}
      transition={{ duration: n.dur, delay: n.delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: n.dot }} />
      {n.text}
    </motion.div>
  ))
}

function Cta({ onContinue, className = '' }) {
  return (
    <button
      onClick={onContinue}
      className={`group flex items-center justify-center gap-2 rounded-[16px] bg-action hover:bg-action-hover text-white text-body font-semibold transition-colors ${className}`}
      style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
    >
      Por aqui <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
    </button>
  )
}

export default function WelcomePage({ onContinue }) {
  const reduce = useReducedMotion()

  return (
    <>
      {/* Mobile and tablet portrait */}
      <div className="flex flex-col flex-1 px-6 relative z-10 lg:hidden">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <Headline className="mb-4" />
          <Subline />
        </div>

        <div className="w-full pb-14 max-w-[480px] mx-auto">
          <div className="flex justify-center relative z-[1]" style={{ marginBottom: -90 }}>
            <Mascot
              pose="login"
              width={300}
              style={{ filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.35))' }}
            />
          </div>
          <Cta onContinue={onContinue} className="relative z-[2] w-full py-[18px] px-[22px]" />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex flex-col flex-1 relative z-10 px-12 py-8">
        <Wordmark />
        <div className="flex-1 grid grid-cols-2 items-center gap-12 max-w-[1180px] w-full mx-auto">
          <div>
            <Headline className="!text-[4rem] !leading-[1.02] mb-6" />
            <Subline className="!text-title mb-9 max-w-[420px]" />
            <Cta onContinue={onContinue} className="px-10 py-4 text-title" />
          </div>
          <div className="relative mx-auto w-[520px] h-[460px]">
            <NoteCloud reduce={reduce} />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={reduce ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Mascot
                pose="login"
                width={340}
                style={{ filter: 'drop-shadow(0 18px 28px rgba(0,0,0,0.25))' }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
