const EXAMPLE_TEXT = 'Preciso entregar o relatório pro cliente hoje, reunião amanhã às 9h, ' +
  'ligar pro fornecedor essa semana, comprar café e pagar a conta de luz antes de sexta'

export function ExampleCard({ onFill }) {
  return (
    <div
      onClick={() => onFill(EXAMPLE_TEXT)}
      style={{
        background: 'var(--bg-card)', border: '0.5px solid var(--border-default)',
        borderRadius: 16, padding: '14px 16px', cursor: 'pointer',
        transition: 'border-color 0.18s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand-hover)' }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)' }}
    >
      <div style={{
        fontSize: 11, fontWeight: 500, color: 'var(--text-hint)',
        textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6,
      }}>
        💡 Clique pra testar
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        &ldquo;{EXAMPLE_TEXT}&rdquo;
      </p>
    </div>
  )
}
