import { useState } from 'react'
import { LoginModal } from '../components/auth/LoginModal'

export function Landing() {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-3xl font-bold mb-2">DumpIt</h1>
      <p className="text-gray-600 mb-8">dump it, nós organizamos</p>
      <button
        onClick={() => setShowLogin(true)}
        className="bg-indigo-700 text-white px-6 py-2 rounded hover:bg-indigo-800"
      >
        Entrar
      </button>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  )
}
