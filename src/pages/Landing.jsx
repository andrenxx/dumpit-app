import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AmbientBlobs } from '../components/layout/AmbientBlobs'
import { LoginModal } from '../components/auth/LoginModal'
import Mascot from '../components/ui/Mascot'

export function Landing() {
  const [showLogin, setShowLogin] = useState(false)
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, loading, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ position: 'relative' }}>
      <AmbientBlobs />
      <div className="relative w-full flex flex-col items-center" style={{ maxWidth: 340 }}>
        <Mascot
          pose="login"
          className="relative"
          style={{
            width: 150,
            height: 'auto',
            objectFit: 'contain',
            zIndex: 1,
            marginBottom: -54,
            opacity: 0.92,
            filter: 'drop-shadow(0 14px 24px rgba(91,61,242,0.18))',
          }}
        />
        <div
          className="relative glass-surface-strong glass-inset-highlight rounded-[28px] w-full text-center"
          style={{ zIndex: 2, paddingTop: 56, paddingBottom: 28, paddingLeft: 24, paddingRight: 24, boxShadow: '0 12px 36px rgba(91,61,242,0.16)' }}
        >
          <div className="flex items-center justify-center gap-1.5 text-[19px] font-extrabold tracking-tight text-text-primary mb-1">
            dump<span className="px-2 py-0.5 rounded-[9px] bg-brand/[0.07] border border-brand/[0.12] text-brand">it</span>
          </div>
          <p className="text-[13px] text-text-secondary font-medium leading-relaxed mb-5">
            Organize sua bagunça mental com IA.
          </p>
          <button
            onClick={() => setShowLogin(true)}
            className="w-full rounded-2xl py-3 text-[14px] font-bold text-white mb-2.5"
            style={{ background: 'linear-gradient(135deg, #5B3DF2, #4427D6)', border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 6px 16px rgba(91,61,242,0.25)' }}
          >
            Entrar com email
          </button>
        </div>
      </div>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  )
}
