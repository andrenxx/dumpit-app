import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const PRIORITY_OPTIONS = [
  { value: 'alta',  label: 'Alta',  activeClass: 'bg-coral/[0.22] text-[#C24A33]' },
  { value: 'media', label: 'Média', activeClass: 'bg-yellow/[0.28] text-[#8A6418]' },
  { value: 'baixa', label: 'Baixa', activeClass: 'bg-mint/[0.16] text-[#1A8A6C]' },
]

export function TaskEditSheet({ task, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(task.title)
  const [priority, setPriority] = useState(task.priority || 'media')

  function handleSave() {
    if (!title.trim()) return
    onSave({ id: task.id, title: title.trim(), priority })
    onClose()
  }

  function handleDelete() {
    onDelete(task.id)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          className="glass-surface-strong glass-inset-highlight w-full"
          style={{ borderRadius: '24px 24px 0 0', padding: '24px 20px 36px' }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <textarea
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            rows={2}
            placeholder="Nome da task..."
            className="w-full resize-none bg-transparent text-[14px] font-medium text-text-primary placeholder:text-text-hint focus:outline-none mb-4"
            style={{ lineHeight: 1.5 }}
          />

          <div className="flex gap-2 mb-5">
            {PRIORITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPriority(opt.value)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                  priority === opt.value ? opt.activeClass : 'bg-white/50 text-text-hint'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-[16px] text-[14px] font-medium text-white"
              style={{ background: 'linear-gradient(135deg, #5B3DF2, #4427D6)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Salvar
            </button>
            <button
              onClick={handleDelete}
              className="px-5 py-3 rounded-[16px] text-[14px] font-medium"
              style={{ background: 'rgba(194,74,51,0.12)', color: '#C24A33', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Excluir
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
