import { Navigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { Wordmark } from '../ui/Wordmark'

function LoadingScreen() {
  const reduce = useReducedMotion()
  return (
    <div className="h-[100dvh] flex items-center justify-center bg-bg-app">
      <motion.div
        animate={reduce ? undefined : { opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Wordmark />
      </motion.div>
    </div>
  )
}

export function AuthGuard({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/" replace />
  return children
}
