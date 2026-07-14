import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Achievement } from '../types'

interface GamiState {
  xp: number
  achievements: Achievement[]
  addXP: (amount: number) => void
  unlock: (id: string) => void
  level: () => number
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-task', title: 'First Steps', description: 'Create your first task', icon: '🌱' },
  { id: 'first-done', title: 'Getting Things Done', description: 'Complete your first task', icon: '✅' },
  { id: 'streak-3', title: 'On a Roll', description: '3-day habit streak', icon: '🔥' },
  { id: 'focus-1h', title: 'Deep Work', description: 'Log 1 hour of focus', icon: '🎯' },
  { id: 'level-5', title: 'Rising Star', description: 'Reach level 5', icon: '⭐' },
]

export const useGami = create<GamiState>()(
  persist(
    (set, get) => ({
      xp: 0,
      achievements: DEFAULT_ACHIEVEMENTS,
      addXP(amount) { set({ xp: get().xp + amount }) },
      unlock(id) {
        set({
          achievements: get().achievements.map(a =>
            a.id === id && !a.unlockedAt ? { ...a, unlockedAt: new Date().toISOString() } : a,
          ),
        })
      },
      level() { return Math.floor(Math.sqrt(get().xp / 25)) + 1 },
    }),
    { name: 'aurora.gami' },
  ),
)
