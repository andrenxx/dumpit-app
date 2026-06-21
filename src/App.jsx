import { useState } from 'react'
import { createBrowserRouter, RouterProvider, useLocation } from 'react-router-dom'
import { useTheme } from './hooks/useTheme'
import { AnimatePresence, motion } from 'framer-motion'
import { Landing } from './pages/Landing'
import { AuthGuard } from './components/auth/AuthGuard'
import { AmbientBlobs } from './components/layout/AmbientBlobs'
import { TopBar } from './components/layout/TopBar'
import { BottomNav } from './components/layout/BottomNav'
import { LoadingOverlay } from './components/ui/LoadingOverlay'
import { Toaster } from './components/ui/sonner'
import { DumpPage } from './pages/DumpPage'
import { TasksPage } from './pages/TasksPage'

const pageVariants = {
  initial: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit:    (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
}
const pageTransition = { duration: 0.22, ease: 'easeInOut' }

function AppShell() {
  const location = useLocation()
  const fromParse = !!location.state?.tasks
  const [activePage, setActivePage] = useState(fromParse ? 'tarefas' : 'dump')
  const [dir, setDir] = useState(1)
  const [loading, setLoading] = useState(false)

  const navigateTo = (page) => {
    setDir(page === 'tarefas' ? 1 : -1)
    setActivePage(page)
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      maxWidth: 480, margin: '0 auto', overflow: 'hidden', background: 'transparent',
    }}>
      <AmbientBlobs />
      <Toaster position="top-center" />
      <TopBar />
      <LoadingOverlay visible={loading} />
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <AnimatePresence initial={false} custom={dir} mode="wait">
          <motion.div
            key={activePage}
            custom={dir}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}
          >
            {activePage === 'dump'
              ? <DumpPage setLoading={setLoading} onSuccess={() => navigateTo('tarefas')} />
              : <TasksPage />}
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomNav activePage={activePage} onChange={navigateTo} />
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
