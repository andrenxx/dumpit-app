import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AmbientBlobs } from '../components/layout/AmbientBlobs'
import { LoginModal } from '../components/auth/LoginModal'

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
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ position: 'relative' }}>
      <AmbientBlobs />
      <div
        className="glass-surface glass-inset-highlight rounded-[28px] flex flex-col items-center text-center"
        style={{ padding: '40px 36px', maxWidth: 340, width: '90%', boxShadow: '0 8px 28px rgba(91,61,242,0.14)' }}
      >
        <div className="flex items-center gap-1.5 text-[22px] font-medium tracking-tight text-text-primary mb-2">
          dump<span className="px-[8px] py-[3px] rounded-[10px] bg-brand/[0.07] border border-brand/[0.12] text-brand text-[20px]">it</span>
        </div>
        <p className="text-[13px] text-text-secondary mb-8">dump it, nós organizamos</p>
        <button
          onClick={() => setShowLogin(true)}
          className="w-full rounded-[18px] py-3 text-[14px] font-medium text-white shadow-glass-button"
          style={{ background: 'linear-gradient(135deg, #5B3DF2, #4427D6)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Entrar
        </button>
      </div>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  )
}
