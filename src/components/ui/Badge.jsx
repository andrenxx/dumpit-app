const variants = {
  urgente: { bg: '#FFF0EE', color: '#B83A24', label: 'Urgente' },
  normal: { bg: '#FFF6E2', color: '#8A6200', label: 'Normal' },
  depois: { bg: '#F2EFE9', color: '#7A6A5A', label: 'Quando der' },
}

export function Badge({ variant }) {
  const v = variants[variant] || variants.normal
  return (
    <span style={{
      display: 'inline-block', padding: '3px 9px', borderRadius: 6,
      fontSize: 11, fontWeight: 500, background: v.bg, color: v.color,
    }}>
      {v.label}
    </span>
  )
}
