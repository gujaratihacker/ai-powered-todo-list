import { useEffect, useRef } from 'react'
import { useTasks } from '../stores/tasks'
import { useNotif } from '../stores/notifications'

/**
 * Subscribes to the tasks store and emits notifications when tasks are
 * completed or newly created. Runs once at the app root.
 */
export function useTaskNotifications() {
  const push = useNotif(s => s.push)
  const prevRef = useRef<Map<string, string>>(new Map())
  const seenIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    // Seed with current state so we don't fire on first render.
    const initial = useTasks.getState().tasks
    prevRef.current = new Map(initial.map(t => [t.id, t.status]))
    seenIdsRef.current = new Set(initial.map(t => t.id))

    const unsub = useTasks.subscribe(state => {
      const prev = prevRef.current
      const seen = seenIdsRef.current
      for (const t of state.tasks) {
        const prevStatus = prev.get(t.id)
        if (!seen.has(t.id)) {
          seen.add(t.id)
          push({ kind: 'success', title: 'Task added', body: t.title, href: '/tasks' })
        } else if (prevStatus !== 'completed' && t.status === 'completed') {
          push({ kind: 'success', title: 'Task completed 🎉', body: t.title, href: '/tasks' })
        }
      }
      // Remove ids that no longer exist so re-adds notify again.
      const currentIds = new Set(state.tasks.map(t => t.id))
      for (const id of seen) if (!currentIds.has(id)) seen.delete(id)
      prevRef.current = new Map(state.tasks.map(t => [t.id, t.status]))
    })
    return () => unsub()
  }, [push])
}
