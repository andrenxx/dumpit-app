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
    <div className="flex flex-col flex-1 w-full max-w-[760px] mx-auto px-5 pt-5 lg:px-8 lg:pt-0 overflow-hidden justify-between lg:justify-center">
      <div className="flex flex-col gap-1.5 pb-5 lg:pb-8">
        <h1 className="text-title lg:text-display font-bold text-text-primary">
          O que tá na sua cabeça?
        </h1>
        <p className="text-label lg:text-body text-text-secondary">
          Joga tudo aqui. A IA organiza pra você.
        </p>
      </div>

      <div className="flex flex-col flex-1 gap-3.5 overflow-hidden pb-[110px] lg:pb-0 lg:flex-none lg:overflow-visible">
        <DumpInput
          onSubmit={handleSubmit}
          disabled={submitting}
          inputRef={inputRef}
        />

        {showFreemiumBanner && <FreemiumBanner />}

        {errorToast && (
          <div style={{
            background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border-default))',
            borderRadius: 12, padding: '10px 14px', fontSize: 'var(--fs-label)',
            color: 'hsl(var(--text-primary))',
          }}>
            Algo deu errado. Tente novamente.
          </div>
        )}
      </div>
    </div>
  )
}
