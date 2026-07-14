import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Mail, Phone, MapPin, Globe, Briefcase, Clock, Cake, Camera, Save, ShieldCheck, X } from 'lucide-react'
import { useAuth } from '../stores/auth'
import { useUI, type ThemeMode } from '../stores/ui'
import { useTasks } from '../stores/tasks'
import { useGami } from '../stores/gamification'
import { useNotif } from '../stores/notifications'
import type { User } from '../types'
import { cn } from '../lib/utils'

const ACCENTS = ['#3b63f5', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444']

const TABS = [
  { key: 'account', label: 'Account' },
  { key: 'personal', label: 'Personal Info' },
  { key: 'appearance', label: 'Appearance' },
  { key: 'security', label: 'Security' },
  { key: 'achievements', label: 'Achievements' },
] as const

type TabKey = typeof TABS[number]['key']

export default function Profile() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const initial = (params.get('tab') as TabKey) || 'personal'
  const [tab, setTab] = useState<TabKey>(TABS.some(t => t.key === initial) ? initial : 'personal')

  useEffect(() => { setParams({ tab }, { replace: true }) }, [tab, setParams])

  if (!user) return <div>Please sign in.</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-slate-500 text-sm">Manage your account, personal info, appearance, and security.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <aside className="card p-2 h-max sticky top-20">
          <nav className="flex md:flex-col gap-1 overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'text-left rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition',
                  tab === t.key
                    ? 'bg-brand-500 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
                )}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        <div>
          {tab === 'account' && <AccountTab />}
          {tab === 'personal' && <PersonalTab />}
          {tab === 'appearance' && <AppearanceTab />}
          {tab === 'security' && <SecurityTab />}
          {tab === 'achievements' && <AchievementsTab />}
        </div>
      </div>
    </div>
  )
}

// ---------- Account ----------

function AccountTab() {
  const { user, updateProfile, logout } = useAuth()
  const tasks = useTasks(s => s.tasks)
  const { xp, level } = useGami()
  const done = tasks.filter(t => t.status === 'completed').length
  const fileRef = useRef<HTMLInputElement>(null)
  if (!user) return null

  function onAvatar(f: File) {
    const reader = new FileReader()
    reader.onload = () => updateProfile({ avatarUrl: String(reader.result) })
    reader.readAsDataURL(f)
  }

  return (
    <div className="space-y-4">
      <div className="card p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="relative">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-brand-500 text-white text-4xl font-bold grid place-items-center">
              {user.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 grid place-items-center shadow"
            title="Change photo"
          >
            <Camera size={14} />
          </button>
          <input hidden ref={fileRef} type="file" accept="image/*"
            onChange={e => e.target.files?.[0] && onAvatar(e.target.files[0])} />
        </div>

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-slate-500 truncate">{user.email}</p>
          <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
            {user.verified
              ? <span className="chip bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Verified</span>
              : <span className="chip bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">Unverified</span>}
            <span className="chip bg-slate-100 dark:bg-slate-800">Member since {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <button className="btn-outline" onClick={logout}>Log out</button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Tasks done" value={done} />
        <Stat label="Level" value={level()} />
        <Stat label="XP" value={xp} />
      </div>

      <EmailChangeCard />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card p-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}

// ---------- Email-change with OTP ----------

function EmailChangeCard() {
  const { user, requestEmailChange, confirmEmailChange, cancelEmailChange, emailOtp } = useAuth()
  const push = useNotif(s => s.push)
  const [newEmail, setNewEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [sent, setSent] = useState<string | null>(null) // stub-only OTP display
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!user) return null
  const pending = user.pendingEmail

  async function sendCode() {
    setErr(null)
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newEmail)) { setErr('Please enter a valid email address'); return }
    if (newEmail === user!.email) { setErr('That is already your email'); return }
    setBusy(true)
    const code = await requestEmailChange(newEmail)
    setSent(code)
    push({ kind: 'info', title: 'Verification code sent', body: `We sent a 6-digit code to ${newEmail}.` })
    setBusy(false)
  }

  async function verify() {
    setErr(null); setBusy(true)
    const ok = await confirmEmailChange(otp)
    setBusy(false)
    if (ok) {
      push({ kind: 'success', title: 'Email updated', body: `Your email is now ${newEmail || pending}.` })
      setNewEmail(''); setOtp(''); setSent(null)
    } else {
      setErr('Invalid or expired code — please try again.')
    }
  }

  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Mail size={18} className="text-slate-500" />
        <h3 className="font-semibold">Email address</h3>
      </div>
      <p className="text-sm text-slate-500">Current: <b className="text-slate-700 dark:text-slate-200">{user.email}</b></p>

      {!pending ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            className="input flex-1"
            placeholder="new-email@example.com"
            type="email"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
          />
          <button className="btn-primary" onClick={sendCode} disabled={busy || !newEmail}>
            {busy ? 'Sending…' : 'Send OTP'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm p-3 flex items-start gap-2">
            <ShieldCheck size={16} className="mt-0.5" />
            <div className="flex-1">
              A 6-digit code was sent to <b>{pending}</b>. Enter it below to confirm the change.
              {sent && (
                <div className="mt-1 text-xs opacity-80">
                  (Demo mode — your OTP is <code className="font-mono">{sent}</code>)
                </div>
              )}
              {!sent && emailOtp && (
                <div className="mt-1 text-xs opacity-80">
                  (Demo mode — your OTP is <code className="font-mono">{emailOtp}</code>)
                </div>
              )}
            </div>
            <button className="btn-ghost text-amber-800 dark:text-amber-200" onClick={() => { cancelEmailChange(); setNewEmail(''); setOtp(''); setSent(null) }}>
              <X size={14} />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="input flex-1 tracking-widest text-center text-lg"
              placeholder="••••••"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
            />
            <button className="btn-primary" onClick={verify} disabled={busy || otp.length < 6}>
              {busy ? 'Verifying…' : 'Verify & update'}
            </button>
          </div>
        </div>
      )}

      {err && <p className="text-sm text-red-500">{err}</p>}
    </div>
  )
}

// ---------- Personal info ----------

function PersonalTab() {
  const { user, updateProfile } = useAuth()
  const push = useNotif(s => s.push)
  const [form, setForm] = useState<Partial<User>>(user ?? {})
  const [saved, setSaved] = useState(false)

  useEffect(() => { setForm(user ?? {}) }, [user])

  const timezones = useMemo(() => {
    // A small curated list — swap for Intl.supportedValuesOf('timeZone') for full list.
    return ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Kolkata', 'Asia/Tokyo', 'Australia/Sydney']
  }, [])

  function change<K extends keyof User>(key: K, value: User[K] | undefined) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function save() {
    updateProfile(form)
    push({ kind: 'success', title: 'Profile saved', body: 'Your personal info has been updated.' })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  if (!user) return null

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Personal information</h3>
        <button className="btn-primary" onClick={save}>
          <Save size={14} /> {saved ? 'Saved' : 'Save changes'}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full name">
          <input className="input" value={form.name ?? ''} onChange={e => change('name', e.target.value)} />
        </Field>
        <Field label="Job title" icon={<Briefcase size={14} />}>
          <input className="input" value={form.jobTitle ?? ''} onChange={e => change('jobTitle', e.target.value)} placeholder="Product Manager" />
        </Field>
        <Field label="Company" icon={<Briefcase size={14} />}>
          <input className="input" value={form.company ?? ''} onChange={e => change('company', e.target.value)} placeholder="Acme Inc." />
        </Field>
        <Field label="Phone" icon={<Phone size={14} />}>
          <input className="input" value={form.phone ?? ''} onChange={e => change('phone', e.target.value)} placeholder="+1 555 123 4567" />
        </Field>
        <Field label="Location" icon={<MapPin size={14} />}>
          <input className="input" value={form.location ?? ''} onChange={e => change('location', e.target.value)} placeholder="San Francisco, CA" />
        </Field>
        <Field label="Website" icon={<Globe size={14} />}>
          <input className="input" value={form.website ?? ''} onChange={e => change('website', e.target.value)} placeholder="https://…" />
        </Field>
        <Field label="Birthday" icon={<Cake size={14} />}>
          <input className="input" type="date" value={form.birthday?.slice(0, 10) ?? ''}
            onChange={e => change('birthday', e.target.value ? new Date(e.target.value).toISOString() : undefined)} />
        </Field>
        <Field label="Timezone" icon={<Clock size={14} />}>
          <select className="input" value={form.timezone ?? ''} onChange={e => change('timezone', e.target.value || undefined)}>
            <option value="">Select timezone…</option>
            {timezones.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Bio">
            <textarea className="input min-h-[90px]" value={form.bio ?? ''} onChange={e => change('bio', e.target.value)} placeholder="Tell us a little about yourself…" />
          </Field>
        </div>
      </div>
    </div>
  )
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-500 flex items-center gap-1">{icon}{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

// ---------- Appearance ----------

function AppearanceTab() {
  const { theme, setTheme, accent, setAccent } = useUI()
  return (
    <div className="card p-5 space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Theme</h3>
        <div className="flex flex-wrap gap-2">
          {(['light', 'dark', 'amoled', 'system'] as ThemeMode[]).map(t => (
            <button key={t} className={cn('btn-outline capitalize', theme === t && 'ring-2 ring-brand-500')} onClick={() => setTheme(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-3">Accent color</h3>
        <div className="flex gap-2">
          {ACCENTS.map(c => (
            <button
              key={c}
              onClick={() => setAccent(c)}
              className={cn('w-8 h-8 rounded-full ring-2 hover:ring-slate-400', accent === c ? 'ring-slate-900 dark:ring-white' : 'ring-transparent')}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------- Security (password change stub) ----------

function SecurityTab() {
  const push = useNotif(s => s.push)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [err, setErr] = useState<string | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    if (next.length < 8) return setErr('New password must be at least 8 characters')
    if (next !== confirm) return setErr('Passwords do not match')
    if (!current) return setErr('Please enter your current password')
    // Stubbed — wire to backend later.
    push({ kind: 'success', title: 'Password updated', body: 'Your password was changed successfully.' })
    setCurrent(''); setNext(''); setConfirm('')
  }

  return (
    <form onSubmit={submit} className="card p-5 space-y-3 max-w-lg">
      <h3 className="font-semibold">Change password</h3>
      <input className="input" type="password" placeholder="Current password" value={current} onChange={e => setCurrent(e.target.value)} />
      <input className="input" type="password" placeholder="New password (min 8 chars)" value={next} onChange={e => setNext(e.target.value)} />
      <input className="input" type="password" placeholder="Confirm new password" value={confirm} onChange={e => setConfirm(e.target.value)} />
      {err && <p className="text-sm text-red-500">{err}</p>}
      <button className="btn-primary">Update password</button>
    </form>
  )
}

// ---------- Achievements ----------

function AchievementsTab() {
  const { achievements } = useGami()
  return (
    <div className="card p-5">
      <h3 className="font-semibold mb-3">Achievements</h3>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map(a => (
          <div
            key={a.id}
            className={cn(
              'rounded-lg border p-3 text-sm',
              a.unlockedAt
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                : 'border-slate-200 dark:border-slate-800 opacity-60',
            )}
          >
            <div className="text-2xl">{a.icon}</div>
            <div className="font-medium">{a.title}</div>
            <div className="text-xs text-slate-500">{a.description}</div>
            {a.unlockedAt && <div className="text-[10px] text-emerald-500 mt-1">Unlocked {new Date(a.unlockedAt).toLocaleDateString()}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
