import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'amoled' | 'system'

interface UIState {
  theme: ThemeMode
  accent: string
  sidebarOpen: boolean
  setTheme: (t: ThemeMode) => void
  setAccent: (c: string) => void
  toggleSidebar: () => void
}

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      accent: '#3b63f5',
      sidebarOpen: true,
      setTheme: (theme) => set({ theme }),
      setAccent: (accent) => set({ accent }),
      toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    { name: 'aurora.ui' },
  ),
)

/** Applies the current theme and accent to the DOM. Call from a root effect. */
export function applyTheme() {
  const { theme, accent } = useUI.getState()
  const root = document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = theme === 'dark' || theme === 'amoled' || (theme === 'system' && prefersDark)
  root.classList.toggle('dark', dark)
  root.classList.toggle('amoled', theme === 'amoled')
  root.style.setProperty('--accent', accent)
}
