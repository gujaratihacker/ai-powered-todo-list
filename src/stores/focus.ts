import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FocusSession } from '../types'
import { uid } from '../lib/utils'

interface FocusState {
  sessions: FocusSession[]
  logSession: (s: Omit<FocusSession, 'id'>) => void
}

export const useFocus = create<FocusState>()(
  persist(
    (set, get) => ({
      sessions: [],
      logSession(s) {
        set({ sessions: [{ id: uid('f'), ...s }, ...get().sessions] })
      },
    }),
    { name: 'aurora.focus' },
  ),
)
