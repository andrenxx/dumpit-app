import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
  exit:    { opacity: 0, transition: { duration: 0.14 } },
}

const cardVariants = {
  hidden:  { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit:    { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.14 } },
}

const CONTEXT_MESSAGES = {
  'first-dump': {
    title: 'Quase lá!',
    subtitle: 'Crie sua conta pra eu guardar essas tarefas com segurança. Sem isso, elas se perdem quando você fechar o app.',
  },
  'default': {
    title: 'Bem-vindo de volta',
    subtitle: 'Entra pra continuar de onde parou.',
  },
}

function FieldGroup({ label, type, placeholder, value, onChange, error, showCount = false }) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <label style={{ fontSize: 10.5, fontWeight: 700, color: 'hsl(var(--text-secondary))' }}>
          {label}
        </label>
        {isPassword && showCount && (
          <span style={{ fontSize: 10, color: 'hsl(var(--text-secondary))', opacity: 0.6 }}>
            {value.length} / 8 mín.
          </span>
        )}
      </div>
      <div style={{ position: 'relative' }}>
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          style={{
            width: '100%',
            padding: isPassword ? '11px 38px 11px 13px' : '11px 13px',
            borderRadius: 13,
            fontSize: 12.5,
            fontWeight: 500,
            color: 'hsl(var(--text-primary))',
            background: 'rgba(255,255,255,0.05)',
            border: error ? '1px solid #e53e3e' : '1px solid rgba(255,255,255,0.1)',
            outline: 'none',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            style={{
              position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'hsl(var(--text-secondary))', padding: 2, display: 'flex',
            }}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <p style={{ color: '#e53e3e', fontSize: 11.5, marginTop: 4 }}>{error}</p>}
    </div>
  )
}

function SubmitButton({ children, loading }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: '100%',
        padding: '13px 0',
        borderRadius: 15,
        border: 'none',
        background: loading ? 'rgba(27,157,198,0.5)' : 'linear-gradient(145deg, #1B9DC6, #0E7C9E)',
        boxShadow: '0 8px 20px rgba(27,157,198,0.3)',
        color: 'white',
        fontSize: 13,
        fontWeight: 700,
        cursor: loading ? 'not-allowed' : 'pointer',
        marginTop: 6,
        fontFamily: 'inherit',
      }}
    >
      {loading ? 'Aguarde...' : children}
    </button>
  )
}

function LoginForm({ onSuccess }) {
  const { signInWithPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email inválido'
    if (password.length < 8) e.password = 'Mínimo 8 caracteres'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setApiError(null)
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setLoading(true)
    const { error } = await signInWithPassword(email, password)
    setLoading(false)
    if (error) {
      setApiError('Email ou senha incorretos. Tente novamente.')
    } else {
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup label="Email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} />
      <FieldGroup label="Senha" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} error={errors.password} />
      {apiError && <p style={{ color: '#e53e3e', fontSize: 12, marginBottom: 8 }}>{apiError}</p>}
      <SubmitButton loading={loading}>Entrar</SubmitButton>
    </form>
  )
}

function SignupForm({ onSuccess }) {
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'Informe seu nome'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email inválido'
    if (password.length < 8) e.password = 'Mínimo 8 caracteres'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setApiError(null)
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setLoading(true)
    const { error } = await signUp(email, password, name.trim())
    setLoading(false)
    if (error) {
      setApiError(error.message === 'User already registered'
        ? 'Este email já está cadastrado. Tente entrar.'
        : 'Erro ao criar conta. Tente novamente.')
    } else {
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup label="Nome" type="text" placeholder="Como podemos te chamar?" value={name} onChange={e => setName(e.target.value)} error={errors.name} />
      <FieldGroup label="Email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} />
      <FieldGroup label="Senha" type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={e => setPassword(e.target.value)} error={errors.password} showCount />
      {apiError && <p style={{ color: '#e53e3e', fontSize: 12, marginBottom: 8 }}>{apiError}</p>}
      <SubmitButton loading={loading}>Criar minha conta</SubmitButton>
      <p style={{ textAlign: 'center', fontSize: 9.5, color: 'hsl(var(--text-secondary))', fontWeight: 500, marginTop: 14, lineHeight: 1.6 }}>
        Ao criar conta, você concorda com os<br />
        <a href="/termos" style={{ color: 'hsl(var(--brand))', fontWeight: 700 }}>Termos de Uso</a>{' '}e{' '}
        <a href="/privacidade" style={{ color: 'hsl(var(--brand))', fontWeight: 700 }}>Privacidade</a>
      </p>
    </form>
  )
}

export function LoginModal({ isOpen, onClose, hideClose = false, context = 'default' }) {
  const initialTab = context === 'first-dump' ? 'criar-conta' : 'entrar'
  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    // Intentional: resets active tab each time the modal opens or context changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isOpen) setActiveTab(context === 'first-dump' ? 'criar-conta' : 'entrar')
  }, [isOpen, context])

  const { title, subtitle } = CONTEXT_MESSAGES[context] ?? CONTEXT_MESSAGES.default

  const handleClose = () => {
    setActiveTab(initialTab)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="glass-surface-strong glass-inset-highlight relative"
            style={{
              width: '100%',
              maxWidth: 340,
              margin: '0 24px',
              padding: '28px 18px 22px',
              borderRadius: 22,
              boxShadow: '0 12px 36px var(--shadow-brand-card)',
            }}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {!hideClose && (
              <button
                onClick={handleClose}
                style={{
                  position: 'absolute', top: 16, right: 16,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'hsl(var(--text-secondary))', padding: 4,
                }}
              >
                <X size={18} />
              </button>
            )}

            {/* Context message */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'hsl(var(--text-primary))', marginBottom: 5 }}>
                {title}
              </div>
              <div style={{ fontSize: 11, color: 'hsl(var(--text-secondary))', fontWeight: 500, lineHeight: 1.6 }}>
                {subtitle}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, borderRadius: 13, padding: 3, background: 'rgba(255,255,255,0.04)', marginBottom: 18 }}>
              {['entrar', 'criar-conta'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: 10,
                    border: 'none',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'background 0.15s',
                    ...(activeTab === tab
                      ? { background: 'linear-gradient(145deg, #1B9DC6, #0E7C9E)', color: 'white' }
                      : { background: 'none', color: '#6F6688' }),
                  }}
                >
                  {tab === 'entrar' ? 'Entrar' : 'Criar conta'}
                </button>
              ))}
            </div>

            {activeTab === 'entrar'
              ? <LoginForm onSuccess={handleClose} />
              : <SignupForm onSuccess={handleClose} />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
