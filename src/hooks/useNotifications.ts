import { useCallback, useEffect } from 'react'
import { useTasks } from '../stores/tasks'
import { useNotif } from '../stores/notifications'

/**
 * Wires background notifications:
 *   • Requests OS notification permission on demand.
 *   • Every 30s scans tasks for reminders due now, and for tasks that have just gone overdue,
 *     pushing them into the in-app notification store and (if permitted) the OS.
 *   • De-duplicates using a stable key so the same task can't spam the panel.
 */
export function useNotifications() {
  const tasks = useTasks(s => s.tasks)
  const push = useNotif(s => s.push)
  const hasSeen = useNotif(s => s.hasSeen)
  const markSeen = useNotif(s => s.markSeen)

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported' as const
    if (Notification.permission === 'default') return Notification.requestPermission()
    return Notification.permission
  }, [])

  const notifyOS = useCallback((title: string, body?: string) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission === 'granted') {
      try { new Notification(title, { body, icon: '/favicon.svg' }) } catch { /* Safari */ }
    }
  }, [])

  useEffect(() => {
    const scan = () => {
      const now = Date.now()
      for (const t of tasks) {
        if (t.status === 'completed') continue

        // Reminder inside a 60s window on either side of `reminderAt`.
        if (t.reminderAt) {
          const at = new Date(t.reminderAt).getTime()
          const key = `reminder:${t.id}:${t.reminderAt}`
          if (Math.abs(at - now) < 60_000 && !hasSeen(key)) {
            push({ kind: 'reminder', title: 'Reminder', body: t.title, href: '/tasks', key })
            notifyOS('Reminder', t.title)
            markSeen(key)
          }
        }

        // Overdue — once per due date.
        if (t.dueDate) {
          const due = new Date(t.dueDate).getTime()
          const key = `overdue:${t.id}:${t.dueDate}`
          if (due < now && !hasSeen(key)) {
            push({
              kind: 'warning',
              title: 'Task overdue',
              body: t.title,
              href: '/tasks?filter=overdue',
              key,
            })
            notifyOS('Task overdue', t.title)
            markSeen(key)
          }
        }
      }
    }

    scan()
    const timer = setInterval(scan, 30_000)
    return () => clearInterval(timer)
  }, [tasks, push, hasSeen, markSeen, notifyOS])

  return { requestPermission, notify: notifyOS }
}
