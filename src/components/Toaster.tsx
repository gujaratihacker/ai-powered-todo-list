import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CircleCheck, Info, AlertTriangle, XCircle, Clock, X } from 'lucide-react'
import { useNotif, type AppNotification, type NotificationKind } from '../stores/notifications'
import { cn } from '../lib/utils'

const KIND_ICON: Record<NotificationKind, React.ReactNode> = {
  info: <Info size={16} />,
  success: <CircleCheck size={16} />,
  warning: <AlertTriangle size={16} />,
  error: <XCircle size={16} />,
  reminder: <Clock size={16} />,
}

const KIND_STYLE: Record<NotificationKind, string> = {
  info: 'bg-blue-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  reminder: 'bg-brand-500',
}

/**
 * Renders the last 3 unread notifications as toasts in the bottom-right.
 * Auto-dismisses each after 5s (marks them read).
 */
export function Toaster() {
  const items = useNotif(s => s.items)
  const markRead = useNotif(s => s.markRead)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const active = items.filter(i => !i.read && !dismissed.has(i.id)).slice(0, 3)

  useEffect(() => {
    const timers = active.map(a => setTimeout(() => {
      setDismissed(prev => { const n = new Set(prev); n.add(a.id); return n })
      markRead(a.id)
    }, 5000))
    return () => timers.forEach(clearTimeout)
  }, [active, markRead])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {active.map(n => (
          <ToastItem key={n.id} n={n} onClose={() => {
            setDismissed(prev => { const s = new Set(prev); s.add(n.id); return s })
            markRead(n.id)
          }} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ n, onClose }: { n: AppNotification; onClose: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="card pointer-events-auto overflow-hidden flex"
    >
      <div className={cn('w-1', KIND_STYLE[n.kind])} />
      <div className="flex items-start gap-2 p-3 flex-1 min-w-0">
        <span className={cn('mt-0.5 text-white p-1 rounded', KIND_STYLE[n.kind])}>
          {KIND_ICON[n.kind]}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{n.title}</div>
          {n.body && <div className="text-xs text-slate-500 line-clamp-2">{n.body}</div>}
        </div>
        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" onClick={onClose} aria-label="Dismiss">
          <X size={14} />
        </button>
      </div>
    </motion.div>
  )
}
