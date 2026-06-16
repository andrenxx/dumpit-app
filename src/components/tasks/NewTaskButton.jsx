export function NewTaskButton() {
  return (
    <div style={{
      width: '100%', padding: 11, background: 'var(--bg-card)',
      border: '0.5px solid rgba(60,40,20,0.10)', borderRadius: 14,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      fontSize: 12, fontWeight: 400, color: 'var(--text-hint)', cursor: 'pointer',
      transition: 'border-color 0.18s, color 0.18s', flexShrink: 0,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = 'var(--brand-hover)'
      e.currentTarget.style.color = 'var(--brand)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'rgba(60,40,20,0.10)'
      e.currentTarget.style.color = 'var(--text-hint)'
    }}
    >
      <span style={{ color: 'var(--brand)', fontSize: 15 }}>+</span> Nova task
    </div>
  )
}
