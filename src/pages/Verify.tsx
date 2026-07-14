import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../stores/auth'

export default function Verify() {
  const { verifyEmail, user } = useAuth()
  const nav = useNavigate()
  const [code, setCode] = useState('')
  const [err, setErr] = useState<string | null>(null)

  return (
    <div>
      <h2 className="text-3xl font-bold mb-1">Verify your email</h2>
      <p className="text-slate-500 mb-6">We sent a 6-digit code to <b>{user?.email ?? 'your inbox'}</b>.</p>
      <form
        className="space-y-3"
        onSubmit={async e => {
          e.preventDefault()
          const ok = await verifyEmail(code)
          if (ok) nav('/'); else setErr('Invalid code — try any 4+ digits (stub)')
        }}
      >
        <input className="input tracking-widest text-center text-2xl" maxLength={6} placeholder="••••••" value={code} onChange={e => setCode(e.target.value)} />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button className="btn-primary w-full justify-center">Verify & continue</button>
      </form>
    </div>
  )
}
