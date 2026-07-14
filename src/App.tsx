import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { AuthLayout, RequireAuth } from './layouts/AuthLayout'

// Code-split routes for smaller initial bundle.
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Tasks = lazy(() => import('./pages/Tasks'))
const CalendarPage = lazy(() => import('./pages/CalendarPage'))
const Kanban = lazy(() => import('./pages/Kanban'))
const Focus = lazy(() => import('./pages/Focus'))
const Habits = lazy(() => import('./pages/Habits'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Profile = lazy(() => import('./pages/Profile'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Forgot = lazy(() => import('./pages/Forgot'))
const Verify = lazy(() => import('./pages/Verify'))

function Loading() {
  return (
    <div className="min-h-[40vh] grid place-items-center text-sm text-slate-500">
      Loading…
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/verify" element={<Verify />} />
          </Route>

          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/kanban" element={<Kanban />} />
            <Route path="/focus" element={<Focus />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
