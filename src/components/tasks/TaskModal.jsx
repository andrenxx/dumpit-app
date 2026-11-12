import { useState } from 'react'
import { motion } from 'framer-motion'

const PRIORITY_OPTIONS = [
  { value: 'alta',  label: 'Alta',  bg: 'var(--badge-alta-bg)',  color: 'var(--badge-alta-text)' },
  { value: 'media', label: 'Média', bg: 'var(--badge-media-bg)', color: 'var(--badge-media-text)' },
  { value: 'baixa', label: 'Baixa', bg: 'var(--badge-baixa-bg)', color: 'var(--badge-baixa-text)' },
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
      style={{ background: 'hsl(var(--scrim))', padding: '0 20px' }}
      onClick={onClose}
    >
      <motion.div
        className="surface-raised w-full"
        style={{ borderRadius: 20, padding: '28px 22px 26px', maxWidth: 480 }}
        initial={{ scale: 0.82, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 8 }}
        transition={{ type: 'spring', damping: 26, stiffness: 340 }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div style={{ fontSize: 'var(--fs-label)', fontWeight: 600, color: 'hsl(var(--text-secondary))', marginBottom: 14 }}>
          {isCreate ? 'Nova task' : 'Editar task'}
        </div>

        <textarea
          autoFocus={!window.matchMedia('(pointer: coarse)').matches}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          rows={isCreate ? 3 : 2}
          placeholder="Nome da task..."
          className="w-full resize-none bg-transparent font-semibold text-text-primary placeholder:text-text-hint focus:outline-none"
          style={{ lineHeight: 1.5, marginBottom: 10, fontSize: 'var(--fs-body)' }}
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          rows={isCreate ? 3 : 2}
          placeholder="Descrição (opcional)..."
          className="w-full resize-none bg-transparent text-text-secondary placeholder:text-text-hint focus:outline-none"
          style={{ lineHeight: 1.55, marginBottom: 18, borderTop: '1px solid hsl(var(--border-default))', paddingTop: 10, fontSize: 'var(--fs-body)' }}
        />

        <div className="flex gap-2 mb-5">
          {PRIORITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPriority(opt.value)}
              className={`px-3 py-1.5 rounded-full text-meta font-medium transition-colors ${
                priority === opt.value ? '' : 'bg-surface-sunken text-text-secondary'
              }`}
              style={priority === opt.value ? { background: opt.bg, color: opt.color } : undefined}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-[12px] text-label font-semibold text-white bg-action hover:bg-action-hover"
            style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {isCreate ? 'Criar task' : 'Salvar'}
          </button>
          {!isCreate && (
            <button
              onClick={handleDelete}
              className="px-5 py-3 rounded-[12px] text-label font-medium"
              style={{ background: 'transparent', color: 'hsl(var(--danger))', border: '1px solid hsl(var(--border-default))', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Excluir
            </button>
          )}
        </div>

        {isCreate && (
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 'var(--fs-meta)', color: 'hsl(var(--text-hint))' }}>
            ⌘+Enter para criar
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
