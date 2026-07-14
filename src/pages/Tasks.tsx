import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { QuickAdd } from '../components/QuickAdd'
import { TaskItem } from '../components/TaskItem'
import { FilterBar, applyFilter, type FilterKey } from '../components/FilterBar'
import { useTasks } from '../stores/tasks'
import { ai } from '../ai'

export default function Tasks() {
  const [params] = useSearchParams()
  const initial = (params.get('filter') as FilterKey) ?? 'all'
  const [filter, setFilter] = useState<FilterKey>(initial)
  const tasks = useTasks(s => s.tasks)
  const { update, clearCompleted } = useTasks()
  const q = params.get('q') ?? ''

  const filtered = useMemo(() => applyFilter(tasks, filter, q), [tasks, filter, q])

  async function aiPrioritize() {
    const res = await ai.prioritize(tasks)
    res.forEach(r => update(r.id, { priority: r.priority }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-slate-500 text-sm">
            {filtered.length} of {tasks.length} {q && <>· matching "<b>{q}</b>"</>}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={aiPrioritize}><Sparkles size={16} /> AI Prioritize</button>
          <button className="btn-ghost" onClick={clearCompleted}>Clear completed</button>
        </div>
      </div>

      <QuickAdd />
      <FilterBar value={filter} onChange={setFilter} />

      <div className="grid gap-2">
        <AnimatePresence initial={false}>
          {filtered.map(t => <TaskItem key={t.id} task={t} />)}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="card p-8 text-center text-slate-500 text-sm">
            No tasks match this view.
          </div>
        )}
      </div>
    </div>
  )
}
