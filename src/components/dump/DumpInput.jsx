import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'

const MAX_LENGTH = 1000

export function DumpInput({ value, onChange, onSubmit, disabled, inputRef }) {
  const [focused, setFocused] = useState(false)

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
      style={{ padding: '18px 18px 14px' }}
    >
      <Textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={MAX_LENGTH}
        placeholder="ex: reunião amanhã às 9h com o cliente, relatório urgente pra hoje..."
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="border-none shadow-none focus-visible:ring-0 resize-none min-h-[150px] text-[14px] leading-[1.65] bg-transparent placeholder:text-text-hint"
        style={{ fontFamily: 'inherit', fontSize: 16 }}
      />
      <div
        className="flex items-center justify-between pt-3 mt-2"
        style={{ borderTop: '0.5px solid hsl(var(--brand) / 0.08)' }}
      >
        <span className="text-[11px] text-text-hint">
          {value.length} / {MAX_LENGTH}
        </span>
        <Button
          onClick={onSubmit}
          disabled={disabled}
          size="sm"
          className="rounded-[18px] shadow-glass-button text-[13px] font-medium text-white"
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
