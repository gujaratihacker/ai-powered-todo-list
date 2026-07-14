import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User as UserIcon, Settings, Palette, KeyRound, LogOut, ShieldCheck, Sparkles, ChevronDown } from 'lucide-react'
import { useAuth } from '../stores/auth'
import { useClickOutside } from '../hooks/useClickOutside'

/** Avatar button + dropdown with profile actions. */
export function ProfileMenu() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  useClickOutside(ref, () => setOpen(false))

  if (!user) return null
  const initial = user.name?.[0]?.toUpperCase() ?? user.email[0]?.toUpperCase() ?? 'U'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 pl-1 pr-2 py-1 transition"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-brand-500 text-white grid place-items-center text-sm font-semibold">
            {initial}
          </div>
        )}
        <ChevronDown size={14} className={`text-slate-500 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 card overflow-hidden z-30"
            role="menu"
          >
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 p-3 border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-500 text-white grid place-items-center font-semibold">
                  {initial}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-medium truncate">{user.name}</div>
                <div className="text-xs text-slate-500 truncate">{user.email}</div>
              </div>
            </Link>

            <MenuLink to="/profile" icon={<UserIcon size={16} />} label="View profile" onClick={() => setOpen(false)} />
            <MenuLink to="/profile?tab=account" icon={<Settings size={16} />} label="Account settings" onClick={() => setOpen(false)} />
            <MenuLink to="/profile?tab=appearance" icon={<Palette size={16} />} label="Appearance" onClick={() => setOpen(false)} />
            <MenuLink to="/profile?tab=security" icon={<KeyRound size={16} />} label="Security & password" onClick={() => setOpen(false)} />
            <MenuLink to="/profile?tab=achievements" icon={<Sparkles size={16} />} label="Achievements" onClick={() => setOpen(false)} />
            {!user.verified && (
              <MenuLink to="/verify" icon={<ShieldCheck size={16} className="text-amber-500" />} label="Verify email" onClick={() => setOpen(false)} />
            )}

            <button
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border-t border-slate-200 dark:border-slate-800"
              onClick={() => { setOpen(false); logout(); nav('/login') }}
              role="menuitem"
            >
              <LogOut size={16} /> Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MenuLink({ to, icon, label, onClick }: { to: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link
      to={to}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50"
    >
      <span className="text-slate-500">{icon}</span>
      <span>{label}</span>
    </Link>
  )
}
