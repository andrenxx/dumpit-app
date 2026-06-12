import { useAuth } from '../hooks/useAuth'

export function Dashboard() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={signOut}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Sair
        </button>
      </div>
      <p className="text-gray-600">Olá, {user?.email}</p>
    </div>
  )
}
