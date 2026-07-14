import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Trash2, Clock, Tag, ChevronDown, ChevronRight, Sparkles } from 'lucide-react'
import { useTasks } from '../stores/tasks'
import { useGami } from '../stores/gamification'
import type { Priority, Task } from '../types'
import { cn, fmtDateTime } from '../lib/utils'
import { ai } from '../ai'

const PRIORITY_COLOR: Record<Priority, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-blue-500',
  low: 'bg-slate-400',
}

export function TaskItem({ task }: { task: Task }) {
  const { toggleComplete, remove, update } = useTasks()
  const addXP = useGami(s => s.addXP)
  const [open, setOpen] = useState(false)
  const [breaking, setBreaking] = useState(false)

  const overdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'

  async function breakdown() {
    setBreaking(true)
    const steps = await ai.breakdown(task)
    update(task.id, {
      subtasks: [
        ...task.subtasks,
        ...steps.map(s => ({ id: crypto.randomUUID(), title: s, done: false })),
      ],
    })
    setBreaking(false)
  }

  return (
    <motion.div
      layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
      className={cn('card p-3', task.status === 'completed' && 'opacity-60')}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => { toggleComplete(task.id); if (task.status !== 'completed') addXP(10) }}
          className={cn(
            'mt-0.5 w-5 h-5 rounded-md border grid place-items-center shrink-0',
            task.status === 'completed'
              ? 'bg-brand-500 border-brand-500 text-white'
              : 'border-slate-300 dark:border-slate-700 hover:border-brand-500',
          )}
          aria-label="toggle complete"
        >
          {task.status === 'completed' && <Check size={14} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('w-2 h-2 rounded-full', PRIORITY_COLOR[task.priority])} />
            <input
              value={task.title}
              onChange={e => update(task.id, { title: e.target.value })}
              className={cn(
                'flex-1 bg-transparent outline-none font-medium min-w-0',
                task.status === 'completed' && 'line-through',
              )}
            />
            <button className="btn-ghost" onClick={() => setOpen(o => !o)}>
              {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            <button className="btn-ghost text-red-500" onClick={() => remove(task.id)} title="Delete">
              <Trash2 size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
            {task.dueDate && (
              <span className={cn('flex items-center gap-1', overdue && 'text-red-500 font-medium')}>
                <Clock size={12} /> {fmtDateTime(task.dueDate)}
              </span>
            )}
            {task.category && <span className="chip bg-slate-100 dark:bg-slate-800">{task.category}</span>}
            {task.tags.map(t => (
              <span key={t} className="chip bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                <Tag size={10} className="inline mr-0.5" />{t}
              </span>
            ))}
            {task.subtasks.length > 0 && (
              <span>· {task.subtasks.filter(s => s.done).length}/{task.subtasks.length} subtasks</span>
            )}
          </div>

          {open && (
            <div className="mt-3 space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
              <textarea
                className="input min-h-[70px]"
                placeholder="Notes / description…"
                value={task.description ?? ''}
                onChange={e => update(task.id, { description: e.target.value })}
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <label className="block">
                  <span className="text-slate-500">Priority</span>
                  <select className="input" value={task.priority} onChange={e => update(task.id, { priority: e.target.value as Priority })}>
                    <option value="low">Low</option><option value="medium">Medium</option>
                    <option value="high">High</option><option value="urgent">Urgent</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-slate-500">Due</span>
                  <input type="datetime-local" className="input"
                    value={task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : ''}
                    onChange={e => update(task.id, { dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
                </label>
                <label className="block">
                  <span className="text-slate-500">Category</span>
                  <input className="input" value={task.category ?? ''} onChange={e => update(task.id, { category: e.target.value })} />
                </label>
                <label className="block">
                  <span className="text-slate-500">Est. min</span>
                  <input type="number" className="input" value={task.estimatedMinutes ?? ''} onChange={e => update(task.id, { estimatedMinutes: Number(e.target.value) || undefined })} />
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Subtasks</span>
                  <button type="button" className="btn-ghost text-xs" onClick={breakdown} disabled={breaking}>
                    <Sparkles size={12} /> {breaking ? 'Breaking down…' : 'AI Breakdown'}
                  </button>
                </div>
                <ul className="space-y-1">
                  {task.subtasks.map(s => (
                    <li key={s.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={s.done} onChange={() =>
                        update(task.id, {
                          subtasks: task.subtasks.map(x => x.id === s.id ? { ...x, done: !x.done } : x),
                        })}
                      />
                      <input className="input" value={s.title} onChange={e =>
                        update(task.id, {
                          subtasks: task.subtasks.map(x => x.id === s.id ? { ...x, title: e.target.value } : x),
                        })}
                      />
                    </li>
                  ))}
                </ul>
                <button type="button" className="btn-ghost text-xs mt-1" onClick={() =>
                  update(task.id, { subtasks: [...task.subtasks, { id: crypto.randomUUID(), title: '', done: false }] })
                }>+ Add subtask</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
