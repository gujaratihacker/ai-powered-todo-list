import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '../lib/utils'

export type NotificationKind = 'info' | 'success' | 'warning' | 'error' | 'reminder'

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  body?: string
  createdAt: string
  read: boolean
  /** Deep-link path opened on click, e.g. "/tasks?filter=overdue". */
  href?: string
  /** Free-form metadata used for de-duping (e.g. `reminder:<taskId>`). */
  key?: string
}

interface NotifState {
  items: AppNotification[]
  /** Notifications that have been shown/toasted already this session — never persisted. */
  seenKeys: Set<string>
  push: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'> & { id?: string }) => AppNotification
  markRead: (id: string) => void
  markAllRead: () => void
  remove: (id: string) => void
  clear: () => void
  hasSeen: (key: string) => boolean
  markSeen: (key: string) => void
}

export const useNotif = create<NotifState>()(
  persist(
    (set, get) => ({
      items: [],
      seenKeys: new Set<string>(),
      push(n) {
        const item: AppNotification = {
          id: n.id ?? uid('n'),
          kind: n.kind,
          title: n.title,
          body: n.body,
          href: n.href,
          key: n.key,
          read: false,
          createdAt: new Date().toISOString(),
        }
        set({ items: [item, ...get().items].slice(0, 50) })
        return item
      },
      markRead(id) {
        set({ items: get().items.map(x => (x.id === id ? { ...x, read: true } : x)) })
      },
      markAllRead() {
        set({ items: get().items.map(x => ({ ...x, read: true })) })
      },
      remove(id) {
        set({ items: get().items.filter(x => x.id !== id) })
      },
      clear() {
        set({ items: [] })
      },
      hasSeen(key) {
        return get().seenKeys.has(key)
      },
      markSeen(key) {
        const next = new Set(get().seenKeys)
        next.add(key)
        set({ seenKeys: next })
      },
    }),
    {
      name: 'aurora.notifications',
      // `Set` is not JSON-serialisable; strip it before storing and restore an empty one.
      partialize: (s) => ({ items: s.items }),
    },
  ),
)
