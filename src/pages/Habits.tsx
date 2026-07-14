import { useState } from 'react'
import { useHabits } from '../stores/habits'
import { Flame, Plus, Trash2 } from 'lucide-react'
import { startOfDay } from '../lib/utils'

export default function Habits() {
  const { habits, add, remove, toggleToday, streak } = useHabits()
  const [name, setName] = useState('')
  const [cadence, setCadence] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  const todayISO = startOfDay().toISOString()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Habits</h1>
        <p className="text-slate-500 text-sm">Track daily, weekly and monthly habits. Build streaks.</p>
      </div>

      <form
        className="card p-3 flex flex-wrap items-center gap-2"
        onSubmit={e => {
          e.preventDefault()
          if (!name.trim()) return
          add({ name, cadence, target: 1, color: '#3b63f5' })
          setName('')
        }}
      >
        <input className="input flex-1 min-w-[200px]" placeholder="New habit…" value={name} onChange={e => setName(e.target.value)} />
        <select className="input w-32" value={cadence} onChange={e => setCadence(e.target.value as 'daily' | 'weekly' | 'monthly')}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <button className="btn-primary"><Plus size={16} /> Add</button>
      </form>

      <div className="grid gap-2">
        {habits.map(h => {
          const doneToday = h.history.includes(todayISO)
          const s = streak(h.id)
          const last14 = last14Days(h.history)
          return (
            <div key={h.id} className="card p-3 flex items-center gap-3">
              <button
                onClick={() => toggleToday(h.id)}
                className={`w-10 h-10 rounded-lg grid place-items-center text-white ${doneToday ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                aria-label="toggle habit today"
              >
                {doneToday ? '✓' : ''}
              </button>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{h.name}</div>
                <div className="text-xs text-slate-500 capitalize">{h.cadence}</div>
              </div>
              <div className="flex gap-0.5" aria-label="last 14 days">
                {last14.map((d, i) => (
                  <span key={i} title={d.date} className={`w-2.5 h-6 rounded-sm ${d.done ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                ))}
              </div>
              <div className="flex items-center gap-1 text-orange-500 text-sm font-semibold">
                <Flame size={16} /> {s}
              </div>
              <button className="btn-ghost text-red-500" onClick={() => remove(h.id)}><Trash2 size={16} /></button>
            </div>
          )
        })}
        {habits.length === 0 && <div className="card p-6 text-center text-slate-500 text-sm">No habits yet — add one above.</div>}
      </div>
    </div>
  )
}

function last14Days(history: string[]) {
  const set = new Set(history)
  const out: { date: string; done: boolean }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = startOfDay(); d.setDate(d.getDate() - i)
    out.push({ date: d.toISOString().slice(0, 10), done: set.has(d.toISOString()) })
  }
  return out
}
