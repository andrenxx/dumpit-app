import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

const PRIORITY_OPTIONS = [
  { value: 'alta',  label: 'Alta',  activeClass: 'bg-coral/[0.22] text-[#C24A33]' },
  { value: 'media', label: 'Média', activeClass: 'bg-yellow/[0.28] text-[#8A6418]' },
  { value: 'baixa', label: 'Baixa', activeClass: 'bg-mint/[0.16] text-[#1A8A6C]' },
]

export function NewTaskButton({ onCreateTask }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('media')
  const formRef = useRef(null)

  useEffect(() => {
    if (!editing) return
    function handleClick(e) {
      if (formRef.current && !formRef.current.contains(e.target)) {
        setEditing(false)
        setTitle('')
        setPriority('media')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [editing])

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onCreateTask({ title: title.trim(), priority })
    setTitle('')
    setPriority('media')
    setEditing(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setEditing(false)
      setTitle('')
      setPriority('media')
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      formRef.current?.requestSubmit()
    }
  }

  if (editing) {
    return (
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="glass-surface rounded-[14px] p-3"
        style={{ border: '1px solid rgba(91,61,242,0.2)' }}
      >
        <textarea
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={200}
          rows={1}
          placeholder="Nome da task..."
          className="w-full resize-none bg-transparent text-[13px] font-medium text-text-primary placeholder:text-text-hint focus:outline-none mb-2"
          style={{ lineHeight: 1.4 }}
        />
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1 flex-1">
            {PRIORITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPriority(opt.value)}
                className={`px-2 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  priority === opt.value ? opt.activeClass : 'bg-white/50 text-text-hint'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="px-3 py-1 rounded-[10px] text-[12px] font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #5B3DF2, #4427D6)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Adicionar
          </button>
        </div>
      </form>
    )
  }

  return (
    <motion.button
      whileHover={{ borderColor: '#5B3DF2', color: '#5B3DF2' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setEditing(true)}
      className="w-full flex items-center justify-center gap-1.5 glass-surface rounded-[14px] text-[12px] font-medium text-text-hint cursor-pointer flex-shrink-0"
      style={{
        padding: 11,
        border: '1px dashed rgba(91,61,242,0.25)',
        background: 'rgba(255,255,255,0.45)',
      }}
    >
      <span className="text-brand text-[15px]">+</span> Nova task
    </motion.button>
  )
}
