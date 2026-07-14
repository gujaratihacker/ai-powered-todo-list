import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ListChecks, Calendar, KanbanSquare, Timer, Repeat2, BarChart3, User, Sparkles } from 'lucide-react'
import { cn } from '../lib/utils'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/kanban', label: 'Kanban', icon: KanbanSquare },
  { to: '/focus', label: 'Focus', icon: Timer },
  { to: '/habits', label: 'Habits', icon: Repeat2 },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: User },
]

export function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 backdrop-blur hidden md:flex flex-col">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-slate-200 dark:border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-brand-500 grid place-items-center text-white">
          <Sparkles size={18} />
        </div>
        <span className="font-bold text-lg">Aurora</span>
        <span className="chip bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-200 ml-1">AI</span>
      </div>
      <nav className="p-3 flex-1 space-y-1">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-brand-500 text-white shadow-soft'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
              )
            }
          >
            <l.icon size={18} />
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
        v1.0 · Offline ready
      </div>
    </aside>
  )
}
