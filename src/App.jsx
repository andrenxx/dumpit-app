import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { Dashboard } from './pages/Dashboard'
import { AuthGuard } from './components/auth/AuthGuard'

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  {
    path: '/dashboard',
    element: (
      <AuthGuard>
        <Dashboard />
      </AuthGuard>
    ),
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
