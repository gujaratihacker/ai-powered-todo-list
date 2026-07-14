import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, Trash2, CircleCheck, AlertTriangle, Info, XCircle, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotif, type NotificationKind } from '../stores/notifications'
import { useNotifications } from '../hooks/useNotifications'
import { useClickOutside } from '../hooks/useClickOutside'
import { cn } from '../lib/utils'

const KIND_ICON: Record<NotificationKind, React.ReactNode> = {
  info: <Info size={16} className="text-blue-500" />,
  success: <CircleCheck size={16} className="text-emerald-500" />,
  warning: <AlertTriangle size={16} className="text-amber-500" />,
  error: <XCircle size={16} className="text-red-500" />,
  reminder: <Clock size={16} className="text-brand-500" />,
}

/** Bell button + dropdown panel showing app notifications. */
export function NotificationBell() {
  const items = useNotif(s => s.items)
  const { markRead, markAllRead, remove, clear } = useNotif()
  const { requestPermission } = useNotifications()
  const nav = useNavigate()
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  useClickOutside(ref, () => setOpen(false))

  const unread = items.filter(i => !i.read).length

  async function onOpen() {
    if (!open) await requestPermission()
    setOpen(o => !o)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        className="btn-ghost relative"
        onClick={onOpen}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold grid place-items-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 card overflow-hidden z-30"
            role="menu"
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800">
              <div className="font-semibold text-sm">Notifications</div>
              <div className="flex gap-1">
                <button
                  className="text-xs text-slate-500 hover:text-brand-500 disabled:opacity-40"
                  onClick={markAllRead}
                  disabled={unread === 0}
                >
                  Mark all read
                </button>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <button
                  className="text-xs text-slate-500 hover:text-red-500 disabled:opacity-40"
                  onClick={clear}
                  disabled={items.length === 0}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  You're all caught up.
                </div>
              ) : (
                items.map(n => (
                  <button
                    key={n.id}
                    onClick={() => {
                      markRead(n.id)
                      if (n.href) { setOpen(false); nav(n.href) }
                    }}
                    className={cn(
                      'w-full text-left px-4 py-3 border-b border-slate-100 dark:border-slate-800/60 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition',
                      !n.read && 'bg-brand-50/60 dark:bg-brand-900/10',
                    )}
                  >
                    <div className="mt-0.5">{KIND_ICON[n.kind]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{n.title}</div>
                      {n.body && <div className="text-xs text-slate-500 line-clamp-2">{n.body}</div>}
                      <div className="text-[10px] text-slate-400 mt-0.5">{relativeTime(n.createdAt)}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {!n.read && (
                        <span title="Mark read" onClick={(e) => { e.stopPropagation(); markRead(n.id) }}
                          className="text-slate-400 hover:text-emerald-500"><Check size={14} /></span>
                      )}
                      <span title="Remove" onClick={(e) => { e.stopPropagation(); remove(n.id) }}
                        className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}
