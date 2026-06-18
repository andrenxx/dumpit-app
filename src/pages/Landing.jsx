import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AmbientBlobs } from '../components/layout/AmbientBlobs'
import { LoginModal } from '../components/auth/LoginModal'
import Mascot from '../components/ui/Mascot'
import { Button } from '../components/ui/button'

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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
      <AmbientBlobs />
      <div className="relative w-full flex flex-col items-center" style={{ maxWidth: 340 }}>

        <Mascot
          pose="login"
          className="w-[150px] h-auto relative z-[1] opacity-[0.92]"
          style={{
            objectFit: 'contain',
            marginBottom: '-54px',
            filter: 'drop-shadow(0 14px 24px rgba(91,61,242,0.18))',
          }}
        />

        <div className="relative z-[2] w-full glass-surface-strong
                        rounded-[28px] pt-14 pb-7 px-6
                        shadow-[0_12px_36px_rgba(91,61,242,0.16)]
                        text-center">

          <div className="text-[19px] font-extrabold text-text-primary tracking-tight mb-1">
            dump<span className="text-brand bg-brand/[0.07] border border-brand/[0.12]
                                  px-2 py-0.5 rounded-[9px]">it</span>
          </div>

          <p className="text-[13px] text-text-secondary font-medium leading-relaxed mb-5">
            Organize sua bagunça mental com IA.
          </p>

          <Button
            onClick={() => setShowLogin(true)}
            className="w-full mb-2.5 bg-gradient-to-br from-brand to-brand-deep
                        rounded-2xl py-3 text-[14px] font-bold text-white
                        shadow-[0_6px_16px_rgba(91,61,242,0.25)]"
          >
            Entrar com email
          </Button>

          <Button
            variant="outline"
            className="w-full glass-surface rounded-2xl py-3
                        text-[13px] font-semibold text-text-primary"
          >
            Continuar com Google
          </Button>
        </div>
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  )
}
