import { useState } from 'react'
import { Search, Moon, Sun, Monitor } from 'lucide-react'
import { useUI } from '../stores/ui'
import { useAuth } from '../stores/auth'
import { useNavigate } from 'react-router-dom'
import { useOnline } from '../hooks/useOnline'
import { NotificationBell } from './NotificationBell'
import { ProfileMenu } from './ProfileMenu'

export function Topbar() {
  const { theme, setTheme } = useUI()
  const { user } = useAuth()
  const nav = useNavigate()
  const online = useOnline()
  const [q, setQ] = useState('')

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur sticky top-0 z-20 px-4 md:px-6 flex items-center gap-3">
      <form
        onSubmit={(e) => { e.preventDefault(); nav(`/tasks?q=${encodeURIComponent(q)}`) }}
        className="flex-1 max-w-xl relative"
      >
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          className="input pl-9"
          placeholder="Search tasks, tags, categories…"
        />
      </form>
      <div className="ml-auto flex items-center gap-1.5">
        <span
          className={`chip ${online ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}
          title={online ? 'Online' : 'Offline — changes queued'}
        >
          {online ? 'Online' : 'Offline'}
        </span>
        <button
          className="btn-ghost"
          onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'amoled' : theme === 'amoled' ? 'system' : 'dark')}
          title={`Theme: ${theme}`}
          aria-label="Toggle theme"
        >
          {theme === 'light' && <Sun size={18} />}
          {theme === 'dark' && <Moon size={18} />}
          {theme === 'amoled' && <Moon size={18} className="fill-current" />}
          {theme === 'system' && <Monitor size={18} />}
        </button>
        <NotificationBell />
        {user ? <ProfileMenu /> : <button className="btn-primary" onClick={() => nav('/login')}>Sign in</button>}
      </div>
    </header>
  )
}
