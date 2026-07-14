import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../stores/auth'

export default function Login() {
  const { login, loginWithGoogle } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('demo@aurora.app')
  const [password, setPassword] = useState('demo1234')
  const [loading, setLoading] = useState(false)

  return (
    <div>
      <h2 className="text-3xl font-bold mb-1">Welcome back</h2>
      <p className="text-slate-500 mb-6">Sign in to continue.</p>
      <form
        onSubmit={async e => {
          e.preventDefault(); setLoading(true)
          await login(email, password); setLoading(false); nav('/')
        }}
        className="space-y-3"
      >
        <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
        <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
        <button className="btn-primary w-full justify-center" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" /> OR <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      </div>
      <button
        onClick={async () => { await loginWithGoogle(); nav('/') }}
        className="btn-outline w-full justify-center"
      >
        Continue with Google
      </button>
      <div className="mt-6 text-sm text-slate-500 flex justify-between">
        <Link to="/forgot" className="hover:underline">Forgot password?</Link>
        <Link to="/register" className="hover:underline">Create account</Link>
      </div>
    </div>
  )
}
