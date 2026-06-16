const items = [
  { id: 'dump', icon: '✦', label: 'Dump' },
  { id: 'tarefas', icon: '☰', label: 'Tarefas' },
]

export function BottomNav({ activePage, onChange }) {
  return (
    <div style={{
      display: 'flex', background: 'var(--bg-card)',
      borderTop: '0.5px solid var(--border-default)', height: 64, flexShrink: 0,
    }}>
      {items.map((item) => {
        const active = activePage === item.id
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
              padding: '10px 0', border: 'none', background: 'transparent',
              cursor: 'pointer', transition: 'color 0.15s',
              color: active ? 'var(--brand)' : 'var(--text-hint)',
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.2px' }}>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
