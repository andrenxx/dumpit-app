import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { AmbientBlobs } from '../components/layout/AmbientBlobs'
import { Toaster } from '../components/ui/sonner'
import { LoadingOverlay } from '../components/ui/LoadingOverlay'
import { LoginModal } from '../components/auth/LoginModal'
import WelcomePage from './WelcomePage'
import { DumpPage } from './DumpPage'

export function Landing() {
  const [hasSeenWelcome, setHasSeenWelcome] = useState(
    () => localStorage.getItem('dumpit_seen_welcome') === 'true'
  )
  const [pendingText, setPendingText] = useState(null)
  const [showLoginOverlay, setShowLoginOverlay] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Redirect already-logged-in users (skip if pendingText — resend effect handles navigation)
  useEffect(() => {
    if (!authLoading && user && !pendingText) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, authLoading, pendingText, navigate])

  // After login: auto-resend the pending dump text
  useEffect(() => {
    if (!user || !pendingText) return
    async function resend() {
      setShowLoginOverlay(false)
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { setLoading(false); return }
        const res = await fetch('/api/parse-tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ text: pendingText }),
        })
        setPendingText(null)
        setLoading(false)
        if (res.status === 200) {
          navigate('/dashboard', { replace: true })
        }
      } catch {
        setLoading(false)
      }
    }
    resend()
  }, [user, pendingText, navigate])

  function handleContinue() {
    localStorage.setItem('dumpit_seen_welcome', 'true')
    setHasSeenWelcome(true)
  }

  if (authLoading) return null

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      maxWidth: 480, margin: '0 auto', overflow: 'hidden', background: 'transparent',
    }}>
      <AmbientBlobs />
      <Toaster position="top-center" />
      <LoadingOverlay visible={loading} />

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {!hasSeenWelcome ? (
          <WelcomePage onContinue={handleContinue} />
        ) : (
          <DumpPage
            setLoading={setLoading}
            onSuccess={() => navigate('/dashboard', { replace: true })}
            onLoginRequired={(text) => {
              setPendingText(text)
              setShowLoginOverlay(true)
            }}
          />
        )}
      </div>

      {showLoginOverlay && (
        <LoginModal
          isOpen
          onClose={() => setShowLoginOverlay(false)}
        />
      )}
    </div>
  )
}
