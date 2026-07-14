import { useEffect } from 'react'
import { applyTheme, useUI } from '../stores/ui'

export function useTheme() {
  const theme = useUI(s => s.theme)
  const accent = useUI(s => s.accent)
  useEffect(() => { applyTheme() }, [theme, accent])
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme()
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
}
