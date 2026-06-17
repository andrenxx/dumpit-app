import { Button } from '../ui/button'

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
        <Button
          onClick={onSubmit}
          disabled={disabled}
          size="sm"
          style={{ fontFamily: 'inherit', fontSize: 13 }}
        >
          Dump ✦
        </Button>
      </div>
    </div>
  )
}
