import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { AuthGuard } from './components/auth/AuthGuard'
import { TopBar } from './components/layout/TopBar'
import { BottomNav } from './components/layout/BottomNav'
import { LoadingOverlay } from './components/ui/LoadingOverlay'
import { DumpPage } from './pages/DumpPage'
import { TasksPage } from './pages/TasksPage'

function AppShell() {
  const [activePage, setActivePage] = useState('dump') // 'dump' | 'tarefas'
  const [loading, setLoading] = useState(false)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      maxWidth: 480, margin: '0 auto', overflow: 'hidden', background: 'var(--bg-app)',
    }}>
      <TopBar />
      <LoadingOverlay visible={loading} />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activePage === 'dump'
          ? <DumpPage setLoading={setLoading} onSuccess={() => setActivePage('tarefas')} />
          : <TasksPage />}
      </div>
      <BottomNav activePage={activePage} onChange={setActivePage} />
    </div>
  )
}

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  {
    path: '/dashboard',
    element: (
      <AuthGuard>
        <AppShell />
      </AuthGuard>
    ),
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
