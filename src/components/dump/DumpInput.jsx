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
  }

  function handleBlur() {
    setFocused(false)
    if (!text.trim()) setIsPristine(true)
  }

  function handleChange(e) {
    const val = e.target.value
    setText(val)
    if (isPristine && val.length > 0) setIsPristine(false)
  }

  function handleSubmit() {
    const finalText = isPristine ? EXAMPLE_TEXT : text
    if (!finalText.trim()) return
    onSubmit(finalText)
  }

  const placeholderOpacity = isPristine && !focused ? 0.45 : 0

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
      style={{ padding: '18px 18px 0', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', overflow: 'hidden' }}
    >
      {/* Placeholder overlay — fades in/out via CSS transition */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 18,
          left: 18,
          right: 18,
          pointerEvents: 'none',
          opacity: placeholderOpacity,
          transition: 'opacity 0.25s ease',
          color: 'hsl(var(--text-secondary))',
          fontSize: 16,
          fontFamily: 'inherit',
          lineHeight: 1.65,
          userSelect: 'none',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {EXAMPLE_TEXT}
      </div>

      <Textarea
        ref={inputRef}
        value={text}
        onChange={handleChange}
        maxLength={MAX_LENGTH}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="border-none shadow-none focus-visible:ring-0 resize-none text-[14px] leading-[1.65] bg-transparent"
        style={{
          fontFamily: 'inherit',
          fontSize: 16,
          flex: 1,
          minHeight: 0,
          color: 'hsl(var(--text-primary))',
          position: 'relative',
          zIndex: 1,
        }}
      />

      <div
        className="flex items-end justify-between mt-auto"
        style={{ borderTop: '0.5px solid hsl(var(--brand) / 0.08)' }}
      >
        <Mascot
          pose="dump"
          width={240}
          style={{
            marginBottom: -55,
            marginLeft: -65,
            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
          }}
        />
        <Button
          onClick={handleSubmit}
          disabled={disabled}
          className="rounded-[18px] shadow-glass-button text-[15px] font-semibold text-white mb-[13px] mr-[13px] px-5 py-3"
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
