import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import Mascot from '../ui/Mascot'

const MAX_LENGTH = 1000
const EXAMPLE_TEXT = 'Preciso entregar o relatório pro cliente hoje, reunião amanhã às 9h, ligar pro fornecedor essa semana, comprar café e pagar a conta de luz antes de sexta'

export function DumpInput({ onSubmit, disabled, inputRef }) {
  const [text, setText] = useState('')
  const [isPristine, setIsPristine] = useState(true)
  const [focused, setFocused] = useState(false)

  function handleFocus() {
    setFocused(true)
    if (isPristine) {
      setIsPristine(false)
    }
  }

  function handleSubmit() {
    const finalText = isPristine ? EXAMPLE_TEXT : text
    if (!finalText.trim()) return
    onSubmit(finalText)
  }

  return (
    <motion.div
      animate={{
        y: focused ? -2 : 0,
        boxShadow: focused
          ? '0 10px 28px rgba(14,124,158,0.18)'
          : '0 6px 18px rgba(14,124,158,0.12)',
      }}
      transition={{ duration: 0.2 }}
      className="glass-surface-strong glass-inset-highlight rounded-[26px]"
      style={{ padding: '18px 18px 0' }}
    >
      <Textarea
        ref={inputRef}
        value={isPristine ? EXAMPLE_TEXT : text}
        onChange={(e) => setText(e.target.value)}
        maxLength={MAX_LENGTH}
        onFocus={handleFocus}
        onBlur={() => setFocused(false)}
        className="border-none shadow-none focus-visible:ring-0 resize-none min-h-[150px] text-[14px] leading-[1.65] bg-transparent"
        style={{
          fontFamily: 'inherit',
          fontSize: 16,
          color: isPristine ? 'rgba(237,234,245,0.35)' : 'hsl(var(--text-primary))',
        }}
      />

      <div
        className="flex items-end justify-between mt-auto"
        style={{ borderTop: '0.5px solid hsl(var(--brand) / 0.08)' }}
      >
        <Mascot
          pose="dump"
          width={104}
          style={{
            marginTop: -6,
            marginLeft: -3,
            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
          }}
        />
        <Button
          onClick={handleSubmit}
          disabled={disabled}
          size="sm"
          className="rounded-[18px] shadow-glass-button text-[13px] font-medium text-white mb-[13px] mr-[13px]"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--brand)), hsl(var(--brand-deep)))',
            fontFamily: 'inherit',
            border: 'none',
          }}
        >
          Dump <Sparkles size={13} className="ml-1" />
        </Button>
      </div>
    </motion.div>
  )
}
