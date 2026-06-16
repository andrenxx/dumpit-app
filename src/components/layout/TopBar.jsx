import { useAuth } from '../../hooks/useAuth'

function getInitials(email) {
  if (!email) return ''
  return email[0].toUpperCase()
}

export function TopBar() {
  const { user } = useAuth()

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px 10px', background: 'var(--bg-app)', flexShrink: 0,
    }}>
      <div style={{ fontSize: 17, fontWeight: 500, color: 'var(--brand)', letterSpacing: '-0.3px' }}>
        dumpit
      </div>
      <div style={{
        width: 30, height: 30, borderRadius: '50%',
        background: 'var(--bg-accent-light)', color: 'var(--brand)',
        border: '1px solid rgba(43,28,154,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 500,
      }}>
        {getInitials(user?.email)}
      </div>
    </div>
  )
}
