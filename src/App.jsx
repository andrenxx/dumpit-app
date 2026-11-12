import { useEffect, useState } from 'react'
import {
  createBrowserRouter, RouterProvider, Outlet, Navigate,
  useLocation, useNavigate, useOutletContext,
} from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from './hooks/useTheme'
import { Landing } from './pages/Landing'
import { AuthGuard } from './components/auth/AuthGuard'
import { Sidebar } from './components/layout/Sidebar'
import { TopBar } from './components/layout/TopBar'
import { BottomNav } from './components/layout/BottomNav'
import { LoadingOverlay } from './components/ui/LoadingOverlay'
import { Toaster } from './components/ui/sonner'
import { DumpPage } from './pages/DumpPage'
import { TasksPage } from './pages/TasksPage'

const SHORTCUTS = { d: '/dashboard/dump', t: '/dashboard/tarefas' }

function isTyping(el) {
  return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
}

function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    function onKey(e) {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(document.activeElement)) return
      const to = SHORTCUTS[e.key.toLowerCase()]
      if (to && to !== location.pathname) navigate(to)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [location.pathname, navigate])

  return (
    <div className="flex h-[100dvh] bg-bg-app overflow-hidden">
      <Toaster position="top-center" />
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className="flex-1 min-h-0 relative">
          <LoadingOverlay visible={loading} />
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col"
          >
            <Outlet context={{ setLoading }} />
          </motion.div>
        </main>
        <BottomNav />
      </div>
    </div>
  )
}

function DashboardIndex() {
  const location = useLocation()
  return (
    <Navigate
      to={location.state?.tasks ? 'tarefas' : 'dump'}
      state={location.state}
      replace
    />
  )
}

function DashboardDump() {
  const { setLoading } = useOutletContext()
  const navigate = useNavigate()
  return <DumpPage setLoading={setLoading} onSuccess={() => navigate('/dashboard/tarefas')} />
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
    children: [
      { index: true, element: <DashboardIndex /> },
      { path: 'dump', element: <DashboardDump /> },
      { path: 'tarefas', element: <TasksPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

function ThemeProvider({ children }) {
  useTheme()
  return children
}

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
