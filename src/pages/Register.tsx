import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../stores/auth'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  return (
    <div>
      <h2 className="text-3xl font-bold mb-1">Create your account</h2>
      <p className="text-slate-500 mb-6">Free forever. No credit card required.</p>
      <form
        className="space-y-3"
        onSubmit={async e => {
          e.preventDefault(); setLoading(true)
          await register(email, password, name); setLoading(false); nav('/verify')
        }}
      >
        <input className="input" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
        <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Password (min 8 chars)" minLength={8} value={password} onChange={e => setPassword(e.target.value)} required />
        <button className="btn-primary w-full justify-center" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-500">
        Already have an account? <Link className="hover:underline" to="/login">Sign in</Link>
      </p>
    </div>
  )
}
