// src/pages/Landing.jsx
//
// Mascote em corpo INTEIRO, sem nenhum corte. Fica atrás do modal de
// login via margin-bottom negativo (o modal, que vem depois no DOM e
// tem z-index maior, cobre a parte inferior do corpo do mascote).
//
// Princípio de design: o mascote aqui é presença de marca, NÃO
// personagem se apresentando. Sem nome, sem fala, sem balão de diálogo.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AmbientBlobs } from '../components/layout/AmbientBlobs'
import { LoginModal } from '../components/auth/LoginModal'
import { Button } from '../components/ui/button'
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
      <AmbientBlobs />
      <div className="relative w-full flex flex-col items-center" style={{ maxWidth: 340 }}>

        <Mascot
          pose="login"
          width={270}
          className="relative z-10 opacity-[0.92]"
          style={{
            marginBottom: -100,
            filter: 'drop-shadow(0 14px 24px rgba(91,61,242,0.18))',
          }}
        />

        <div
          className="relative z-20 w-full rounded-[28px] pt-14 pb-7 px-6 text-center"
          style={{
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(26px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(26px) saturate(1.6)',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 12px 36px rgba(91,61,242,0.16)',
          }}
        >
          <div className="text-[19px] font-extrabold text-text-primary tracking-tight mb-1">
            dump
            <span
              className="text-brand px-2 py-0.5 rounded-[9px] ml-0.5"
              style={{
                background: 'rgba(91,61,242,0.07)',
                border: '1px solid rgba(91,61,242,0.12)',
              }}
            >
              it
            </span>
          </div>

          <p className="text-[13px] text-text-secondary font-medium leading-relaxed mb-5">
            Organize sua bagunça mental com IA.
          </p>

          <Button
            onClick={() => setShowLogin(true)}
            className="w-full mb-2.5 rounded-2xl py-3 text-[14px] font-bold text-white"
            style={{
              background: 'linear-gradient(145deg, #5B3DF2, #4427D6)',
              boxShadow: '0 6px 16px rgba(91,61,242,0.25)',
            }}
          >
            Entrar com email
          </Button>

          <Button
            variant="outline"
            className="w-full rounded-2xl py-3 text-[13px] font-semibold text-text-primary"
            style={{
              background: 'rgba(255,255,255,0.5)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.8)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continuar com Google
          </Button>
        </div>
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Valores que NÃO devem ser alterados sem comparar com
// docs/wireframe_v7.html:
//   - width={150} no Mascot
//   - marginBottom: -54
//   - opacity: 0.92
//   - pt-14 (56px) no modal — é o espaço reservado pra cabeça do
//     mascote aparecer por cima da borda superior do modal
// ─────────────────────────────────────────────────────────────
