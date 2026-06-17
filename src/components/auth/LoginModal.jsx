import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

const modalVariants = {
  hidden:  { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.18, ease: 'easeOut' } },
  exit:    { opacity: 0, scale: 0.95, transition: { duration: 0.14 } },
}

export function LoginModal({ isOpen, onClose }) {
  const { signInWithEmail, verifyOtp } = useAuth()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email')
  const [error, setError] = useState(null)
  const [codeError, setCodeError] = useState(null)

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const { error } = await signInWithEmail(email)
    if (error) {
      setError('Erro ao enviar o código. Tente novamente.')
    } else {
      setStep('code')
    }
  }

  const handleCodeSubmit = async (e) => {
    e.preventDefault()
    setCodeError(null)
    const { error } = await verifyOtp(email, code)
    if (error) {
      setCodeError('Código inválido ou expirado. Tente novamente.')
    } else {
      onClose()
    }
  }

  const handleResend = async () => {
    setCodeError(null)
    setCode('')
    await signInWithEmail(email)
  }

  return (
    <AnimatePresence>
      {isOpen && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        className="bg-white rounded-lg p-8 w-full max-w-sm relative"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit}>
            <h2 className="text-xl font-semibold mb-4">Entrar no DumpIt</h2>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mb-3"
            />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit}>
            <h2 className="text-xl font-semibold mb-2">Digite o código</h2>
            <p className="text-gray-500 text-sm mb-4">
              Enviamos um código de 6 dígitos para <strong>{email}</strong>
            </p>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="000000"
              maxLength={6}
              pattern="\d{6}"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
              className="mb-3 text-center text-2xl tracking-widest"
            />
            {codeError && <p className="text-red-500 text-sm mb-3">{codeError}</p>}
            <Button type="submit" className="w-full">
              Verificar
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleResend}
              className="w-full mt-3 text-sm"
            >
              Reenviar código
            </Button>
          </form>
        )}
      </motion.div>
    </div>
      )}
    </AnimatePresence>
  )
}
