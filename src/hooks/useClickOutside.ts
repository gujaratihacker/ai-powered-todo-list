import { useEffect, type RefObject } from 'react'

/** Calls `handler` when a click / touch happens outside `ref.current`. */
export function useClickOutside<T extends HTMLElement>(ref: RefObject<T | null>, handler: () => void) {
  useEffect(() => {
    function onDown(e: MouseEvent | TouchEvent) {
      const el = ref.current
      if (!el || el.contains(e.target as Node)) return
      handler()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
    }
  }, [ref, handler])
}
