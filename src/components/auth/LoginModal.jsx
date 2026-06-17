import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

export function LoginModal({ isOpen, onClose }) {
  const { signInWithEmail, verifyOtp } = useAuth()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email')
  const [error, setError] = useState(null)
  const [codeError, setCodeError] = useState(null)

  if (!isOpen) return null

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-sm relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit}>
            <h2 className="text-xl font-semibold mb-4">Entrar no DumpIt</h2>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button
              type="submit"
              className="w-full bg-indigo-700 text-white py-2 rounded hover:bg-indigo-800"
            >
              Entrar
            </button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit}>
            <h2 className="text-xl font-semibold mb-2">Digite o código</h2>
            <p className="text-gray-500 text-sm mb-4">
              Enviamos um código de 6 dígitos para <strong>{email}</strong>
            </p>
            <input
              type="text"
              inputMode="numeric"
              placeholder="000000"
              maxLength={6}
              pattern="\d{6}"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
              className="w-full border rounded px-3 py-2 mb-3 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {codeError && <p className="text-red-500 text-sm mb-3">{codeError}</p>}
            <button
              type="submit"
              className="w-full bg-indigo-700 text-white py-2 rounded hover:bg-indigo-800"
            >
              Verificar
            </button>
            <button
              type="button"
              onClick={handleResend}
              className="w-full mt-3 text-sm text-indigo-600 hover:underline"
            >
              Reenviar código
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
