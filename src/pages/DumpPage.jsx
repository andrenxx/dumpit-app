import { useState } from 'react'
import { useRef } from 'react'
import { supabase } from '../lib/supabase'
import { DumpInput } from '../components/dump/DumpInput'
import { FreemiumBanner } from '../components/ui/FreemiumBanner'

export function DumpPage({ setLoading, onSuccess, onLoginRequired }) {
  const [showFreemiumBanner, setShowFreemiumBanner] = useState(false)
  const [errorToast, setErrorToast] = useState(false)
  const inputRef = useRef(null)

  const showError = () => {
    setErrorToast(true)
    setTimeout(() => setErrorToast(false), 3000)
  }

  const handleSubmit = async (finalText) => {
    setShowFreemiumBanner(false)
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/parse-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ text: finalText }),
      })

      if (res.status === 200) {
        setLoading(false)
        onSuccess()
      } else if (res.status === 401 && onLoginRequired) {
        setLoading(false)
        onLoginRequired(finalText)
      } else if (res.status === 402) {
        setLoading(false)
        setShowFreemiumBanner(true)
      } else {
        setLoading(false)
        showError()
      }
    } catch {
      setLoading(false)
      showError()
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', flex: 1,
      padding: '20px 20px 0', justifyContent: 'space-between', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingBottom: 20 }}>
        <h1 style={{
          fontSize: 23, fontWeight: 500, color: 'hsl(var(--text-primary))',
          letterSpacing: '-0.3px', lineHeight: 1.3,
        }}>
          O que tá na sua cabeça?
        </h1>
        <p style={{ fontSize: 13, color: 'hsl(var(--text-secondary))', lineHeight: 1.6 }}>
          Joga tudo aqui. A IA organiza pra você.
        </p>
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', gap: 14,
        overflowY: 'auto', paddingBottom: 20,
      }}>
        <DumpInput
          onSubmit={handleSubmit}
          inputRef={inputRef}
        />

        {showFreemiumBanner && <FreemiumBanner />}

        {errorToast && (
          <div style={{
            background: 'var(--bg-card)', border: '0.5px solid rgba(184,58,36,0.2)',
            borderRadius: 12, padding: '10px 14px', fontSize: 13,
            color: 'hsl(var(--text-primary))',
          }}>
            Algo deu errado. Tente novamente.
          </div>
        )}
      </div>
    </div>
  )
}
