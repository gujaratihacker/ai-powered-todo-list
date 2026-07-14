import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Habit } from '../types'
import { startOfDay, uid } from '../lib/utils'

interface HabitState {
  habits: Habit[]
  add: (h: Omit<Habit, 'id' | 'history' | 'createdAt'>) => void
  remove: (id: string) => void
  toggleToday: (id: string) => void
  streak: (id: string) => number
}

function seed(): Habit[] {
  return [
    { id: uid('h'), name: 'Drink water', cadence: 'daily', target: 8, color: '#3b82f6', history: [], createdAt: new Date().toISOString() },
    { id: uid('h'), name: 'Read 20 pages', cadence: 'daily', target: 1, color: '#8b5cf6', history: [], createdAt: new Date().toISOString() },
    { id: uid('h'), name: 'Exercise', cadence: 'weekly', target: 3, color: '#10b981', history: [], createdAt: new Date().toISOString() },
  ]
}

export const useHabits = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: seed(),
      add(h) {
        const habit: Habit = { id: uid('h'), history: [], createdAt: new Date().toISOString(), ...h }
        set({ habits: [habit, ...get().habits] })
      },
      remove(id) { set({ habits: get().habits.filter(h => h.id !== id) }) },
      toggleToday(id) {
        const iso = startOfDay().toISOString()
        set({
          habits: get().habits.map(h => {
            if (h.id !== id) return h
            const hit = h.history.includes(iso)
            return { ...h, history: hit ? h.history.filter(d => d !== iso) : [...h.history, iso] }
          }),
        })
      },
      streak(id) {
        const h = get().habits.find(h => h.id === id)
        if (!h) return 0
        const set = new Set(h.history)
        let streak = 0
        const d = startOfDay()
        while (set.has(d.toISOString())) {
          streak++
          d.setDate(d.getDate() - 1)
        }
        return streak
      },
    }),
    { name: 'aurora.habits' },
  ),
)
