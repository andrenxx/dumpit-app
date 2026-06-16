export function FreemiumBanner() {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '0.5px solid rgba(184,58,36,0.2)',
      borderRadius: 16, padding: '14px 16px', display: 'flex',
      alignItems: 'flex-start', gap: 12,
    }}>
      <div style={{ fontSize: 18, flexShrink: 0, paddingTop: 1 }}>✦</div>
      <div>
        <strong style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 3 }}>
          Você já usou seu crédito gratuito
        </strong>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          A IA é paga. O Kanban manual é pra sempre grátis.<br />
          R$25/mês pra continuar usando a IA.
        </p>
        <button style={{
          marginTop: 10, display: 'inline-flex', padding: '8px 16px',
          background: 'var(--brand)', color: '#fff', border: 'none',
          borderRadius: 10, fontSize: 12, fontWeight: 500, cursor: 'pointer',
        }}>
          Assinar plano pago
        </button>
      </div>
    </div>
  )
}
