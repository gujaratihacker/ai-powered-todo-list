import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../stores/auth'

export default function Forgot() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <div>
      <h2 className="text-3xl font-bold mb-1">Reset password</h2>
      <p className="text-slate-500 mb-6">We'll email you a reset link.</p>
      {sent ? (
        <div className="card p-4 text-sm">
          If an account exists for <b>{email}</b>, a reset link is on its way.
        </div>
      ) : (
        <form className="space-y-3" onSubmit={async e => { e.preventDefault(); await requestPasswordReset(email); setSent(true) }}>
          <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <button className="btn-primary w-full justify-center">Send reset link</button>
        </form>
      )}
      <p className="mt-6 text-sm text-slate-500"><Link className="hover:underline" to="/login">Back to sign in</Link></p>
    </div>
  )
}
