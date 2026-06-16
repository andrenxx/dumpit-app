const MAX_LENGTH = 1000

export function DumpInput({ value, onChange, onSubmit, disabled, inputRef }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1.5px solid var(--brand)',
      borderRadius: 20, padding: '16px 16px 14px',
    }}>
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={MAX_LENGTH}
        placeholder="ex: reunião amanhã às 9h com o cliente, relatório urgente pra hoje, comprar café, ligar pro fornecedor essa semana..."
        style={{
          width: '100%', minHeight: 160, border: 'none', outline: 'none',
          resize: 'none', fontSize: 14, lineHeight: 1.65,
          color: 'var(--text-primary)', background: 'transparent',
          fontFamily: 'inherit',
        }}
      />
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 12, borderTop: '0.5px solid rgba(60,40,20,0.08)', marginTop: 10,
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-hint)' }}>
          {value.length} / {MAX_LENGTH}
        </span>
        <button
          onClick={onSubmit}
          disabled={disabled}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '9px 18px', background: 'var(--brand)', color: '#fff',
            border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500,
            cursor: disabled ? 'default' : 'pointer',
            opacity: disabled ? 0.45 : 1, transition: 'opacity 0.15s',
            fontFamily: 'inherit',
          }}
        >
          Dump ✦
        </button>
      </div>
    </div>
  )
}
