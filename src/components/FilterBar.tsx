import { cn } from '../lib/utils'
import type { Task } from '../types'

export type FilterKey = 'all' | 'today' | 'tomorrow' | 'week' | 'month' | 'completed' | 'pending' | 'overdue' | 'high'
export const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Completed' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'high', label: 'High Priority' },
]

export function applyFilter(tasks: Task[], key: FilterKey, q?: string): Task[] {
  const now = new Date()
  const today = new Date(now); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7)
  const monthEnd = new Date(today); monthEnd.setMonth(today.getMonth() + 1)

  let out = tasks.filter(t => {
    const d = t.dueDate ? new Date(t.dueDate) : null
    switch (key) {
      case 'all': return true
      case 'today': return d && d >= today && d < tomorrow
      case 'tomorrow': return d && d >= tomorrow && d < new Date(tomorrow.getTime() + 86400000)
      case 'week': return d && d >= today && d < weekEnd
      case 'month': return d && d >= today && d < monthEnd
      case 'completed': return t.status === 'completed'
      case 'pending': return t.status !== 'completed'
      case 'overdue': return d && d < now && t.status !== 'completed'
      case 'high': return t.priority === 'high' || t.priority === 'urgent'
    }
  })

  if (q) {
    const s = q.toLowerCase()
    out = out.filter(t =>
      t.title.toLowerCase().includes(s) ||
      t.description?.toLowerCase().includes(s) ||
      t.category?.toLowerCase().includes(s) ||
      t.tags.some(tag => tag.toLowerCase().includes(s)) ||
      t.priority.includes(s) ||
      t.status.includes(s),
    )
  }
  return out
}

export function FilterBar({ value, onChange }: { value: FilterKey; onChange: (k: FilterKey) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {FILTERS.map(f => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={cn(
            'chip whitespace-nowrap px-3 py-1.5 border transition',
            value === f.key
              ? 'bg-brand-500 text-white border-brand-500'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-500',
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
