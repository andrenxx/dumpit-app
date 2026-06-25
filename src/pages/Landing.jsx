import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
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
  const [showLoginOnly, setShowLoginOnly] = useState(false)
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

  // Show login-only screen after logout (flag set by TopBar before signOut)
  useEffect(() => {
    if (!authLoading && !user) {
      const flag = localStorage.getItem('dumpit_show_login')
      if (flag) {
        localStorage.removeItem('dumpit_show_login')
        // Intentional: flag must be consumed in the same auth-state cycle; async callback would miss the window
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShowLoginOnly(true)
      }
    }
  }, [authLoading, user])

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
        if (res.status === 200) {
          const { tasks } = await res.json()
          setPendingText(null)
          setLoading(false)
          navigate('/dashboard', { replace: true, state: { tasks: tasks ?? [] } })
        } else {
          setPendingText(null)
          setLoading(false)
          toast.error('Algo deu errado ao organizar suas tarefas. Tente de novo.')
        }
      } catch {
        setLoading(false)
        toast.error('Algo deu errado ao organizar suas tarefas. Tente de novo.')
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
        {!showLoginOnly && (
          <AnimatePresence mode="wait">
            {!hasSeenWelcome ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <WelcomePage onContinue={handleContinue} />
              </motion.div>
            ) : (
              <motion.div
                key="dump"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <DumpPage
                  setLoading={setLoading}
                  onSuccess={(tasks) => navigate('/dashboard', { replace: true, state: { tasks } })}
                  onLoginRequired={(text) => {
                    setPendingText(text)
                    setShowLoginOverlay(true)
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <LoginModal
        isOpen={showLoginOnly || showLoginOverlay}
        hideClose={showLoginOnly}
        context={showLoginOverlay ? 'first-dump' : 'default'}
        onClose={() => { setShowLoginOnly(false); setShowLoginOverlay(false) }}
      />
    </div>
  )
}
