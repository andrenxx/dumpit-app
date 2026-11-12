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

  const placeholderOpacity = isPristine && !focused ? 1 : 0

  return (
    <motion.div
      animate={{ y: focused ? -2 : 0 }}
      transition={{ duration: 0.2 }}
      className="surface-raised rounded-[20px] lg:!flex-none lg:h-[400px]"
      style={{ borderColor: focused ? 'hsl(var(--brand))' : undefined, padding: '18px 18px 0', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', overflow: 'hidden' }}
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
          color: 'hsl(var(--text-hint))',
          fontSize: 'var(--fs-body)',
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
        className="border-none shadow-none focus-visible:ring-0 resize-none leading-[1.65] bg-transparent"
        style={{
          fontFamily: 'inherit',
          fontSize: 'var(--fs-body)',
          flex: 1,
          minHeight: 0,
          color: 'hsl(var(--text-primary))',
          position: 'relative',
          zIndex: 1,
        }}
      />

      <div
        className="flex items-end justify-between mt-auto"
        style={{ borderTop: '1px solid hsl(var(--border-default))' }}
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
          className="rounded-[14px] text-label font-semibold text-white group bg-action hover:bg-action-hover mb-[13px] mr-[13px] px-5 py-3"
          style={{
            fontFamily: 'inherit',
            border: 'none',
          }}
        >
          Dump <Sparkles size={14} className="ml-1 transition-transform duration-200 group-hover:rotate-12 group-hover:scale-110" />
        </Button>
      </div>
    </motion.div>
  )
}
