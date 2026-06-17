import { useAuth } from '../../hooks/useAuth'

function getInitial(email) {
  return email ? email[0].toUpperCase() : ''
}

export function TopBar() {
  const { user } = useAuth()
  return (
    <div className="glass-surface sticky top-0 z-20 flex items-center justify-between px-5 py-3 border-b border-white/40 flex-shrink-0">
      <div className="flex items-center gap-1.5 text-[17px] font-medium tracking-tight text-text-primary">
        dump
        <span className="px-[7px] py-[2px] rounded-[9px] bg-brand/[0.07] border border-brand/[0.12] backdrop-blur-xs text-brand text-[15px]">
          it
        </span>
      </div>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'linear-gradient(145deg, #FF6F52, #FFA988)',
        boxShadow: '0 3px 10px rgba(255,111,82,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 600, color: '#fff',
      }}>
        {getInitial(user?.email)}
      </div>
    </div>
  )
}
