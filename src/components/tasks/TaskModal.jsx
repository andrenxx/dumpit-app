import { useState } from 'react'
import { motion } from 'framer-motion'

const PRIORITY_OPTIONS = [
  { value: 'alta',  label: 'Alta',  activeClass: 'bg-coral/[0.22] text-[#C24A33]' },
  { value: 'media', label: 'Média', activeClass: 'bg-yellow/[0.28] text-[#8A6418]' },
  { value: 'baixa', label: 'Baixa', activeClass: 'bg-mint/[0.16] text-[#1A8A6C]' },
]

export function TaskModal({ mode, task, onClose, onSave, onDelete }) {
  const isCreate = mode === 'create'
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority, setPriority] = useState(task?.priority ?? 'media')

  function handleSave() {
    if (!title.trim()) return
    onSave({ id: task?.id, title: title.trim(), description: description.trim() || null, priority })
    onClose()
  }

  function handleDelete() {
    onDelete(task.id)
    onClose()
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') onClose()
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave()
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{ background: 'rgba(20,15,45,0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', padding: '0 20px' }}
      onClick={onClose}
    >
      <motion.div
        className="glass-surface-strong glass-inset-highlight w-full"
        style={{ borderRadius: 24, padding: '28px 22px 26px', maxWidth: 480 }}
        initial={{ scale: 0.82, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 8 }}
        transition={{ type: 'spring', damping: 26, stiffness: 340 }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: '#ACA4C8', letterSpacing: '0.06em', marginBottom: 14, textTransform: 'uppercase' }}>
          {isCreate ? 'Nova task' : 'Editar task'}
        </div>

        <textarea
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          rows={isCreate ? 3 : 2}
          placeholder="Nome da task..."
          className="w-full resize-none bg-transparent text-[15px] font-semibold text-text-primary placeholder:text-text-hint focus:outline-none"
          style={{ lineHeight: 1.5, marginBottom: 10 }}
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          rows={isCreate ? 3 : 2}
          placeholder="Descrição (opcional)..."
          className="w-full resize-none bg-transparent text-[13px] text-text-secondary placeholder:text-text-hint focus:outline-none"
          style={{ lineHeight: 1.55, marginBottom: 18, borderTop: '1px solid hsl(var(--brand) / 0.08)', paddingTop: 10 }}
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
            className="flex-1 py-3 rounded-[16px] text-[14px] font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, hsl(var(--brand)), hsl(var(--brand-deep)))', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {isCreate ? 'Criar task' : 'Salvar'}
          </button>
          {!isCreate && (
            <button
              onClick={handleDelete}
              className="px-5 py-3 rounded-[16px] text-[14px] font-medium"
              style={{ background: 'rgba(194,74,51,0.12)', color: '#C24A33', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Excluir
            </button>
          )}
        </div>

        {isCreate && (
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: '#ACA4C8' }}>
            ⌘+Enter para criar
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
