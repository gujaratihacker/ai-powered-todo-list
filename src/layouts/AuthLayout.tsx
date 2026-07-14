import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../stores/auth'
import { Sparkles } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export function AuthLayout() {
  useTheme()
  const user = useAuth(s => s.user)
  if (user) return <Navigate to="/" replace />
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex bg-gradient-to-br from-brand-600 via-brand-500 to-purple-500 text-white p-10 flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-white/20 grid place-items-center"><Sparkles size={20} /></div>
          <span className="text-2xl font-bold">Aurora</span>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold leading-tight">Your day, organized by AI.</h1>
          <p className="mt-3 opacity-90 max-w-md">
            Natural-language quick-add, smart scheduling, focus sessions, habits, and analytics — all in one place.
          </p>
        </div>
        <div className="opacity-70 text-sm">© {new Date().getFullYear()} Aurora</div>
      </div>
      <div className="grid place-items-center p-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuth(s => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
