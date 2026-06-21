import { useState } from 'react'
import { useRef } from 'react'
import { supabase } from '../lib/supabase'
import { DumpInput } from '../components/dump/DumpInput'
import { FreemiumBanner } from '../components/ui/FreemiumBanner'

export function DumpPage({ setLoading, onSuccess, onLoginRequired }) {
  const [showFreemiumBanner, setShowFreemiumBanner] = useState(false)
  const [errorToast, setErrorToast] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef(null)

  const showError = () => {
    setErrorToast(true)
    setTimeout(() => setErrorToast(false), 3000)
  }

  const handleSubmit = async (finalText) => {
    setShowFreemiumBanner(false)
    setLoading(true)
    setSubmitting(true)

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
        const { tasks } = await res.json()
        setLoading(false)
        setSubmitting(false)
        onSuccess(tasks ?? [])
      } else if (res.status === 401 && onLoginRequired) {
        setLoading(false)
        setSubmitting(false)
        onLoginRequired(finalText)
      } else if (res.status === 402) {
        setLoading(false)
        setSubmitting(false)
        setShowFreemiumBanner(true)
      } else {
        setLoading(false)
        setSubmitting(false)
        showError()
      }
    } catch {
      setLoading(false)
      setSubmitting(false)
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
          fontSize: 32, fontWeight: 700, color: 'hsl(var(--text-primary))',
          letterSpacing: '-0.5px', lineHeight: 1.2,
        }}>
          O que tá na sua cabeça?
        </h1>
        <p style={{ fontSize: 15, color: 'hsl(var(--text-secondary))', lineHeight: 1.6 }}>
          Joga tudo aqui. A IA organiza pra você.
        </p>
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', gap: 14,
        overflow: 'hidden', paddingBottom: 110,
      }}>
        <DumpInput
          onSubmit={handleSubmit}
          disabled={submitting}
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
