import { useMemo, useState, useEffect } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Sparkles } from 'lucide-react'
import { useTasks } from '../stores/tasks'
import { useFocus } from '../stores/focus'
import { ai } from '../ai'

const COLORS = ['#3b63f5', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444']

type Scope = 'day' | 'week' | 'month'

export default function Analytics() {
  const tasks = useTasks(s => s.tasks)
  const sessions = useFocus(s => s.sessions)
  const [scope, setScope] = useState<Scope>('week')
  const [summary, setSummary] = useState('')

  const barData = useMemo(() => {
    const days = scope === 'day' ? 1 : scope === 'week' ? 7 : 30
    return Array.from({ length: days }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (days - 1 - i)); d.setHours(0, 0, 0, 0)
      const key = d.toISOString().slice(0, 10)
      return {
        day: d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
        completed: tasks.filter(t => t.completedAt?.slice(0, 10) === key).length,
        focus: sessions.filter(s => s.startedAt.slice(0, 10) === key).reduce((a, s) => a + s.focusMinutes, 0),
      }
    })
  }, [tasks, sessions, scope])

  const catData = useMemo(() => {
    const m = new Map<string, number>()
    tasks.forEach(t => m.set(t.category ?? 'Uncategorized', (m.get(t.category ?? 'Uncategorized') ?? 0) + 1))
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }))
  }, [tasks])

  useEffect(() => { ai.summarize(tasks, scope).then(setSummary) }, [tasks, scope])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-slate-500 text-sm">Insights across days, weeks, and months.</p>
        </div>
        <div className="flex gap-1">
          {(['day', 'week', 'month'] as Scope[]).map(s => (
            <button key={s} onClick={() => setScope(s)}
              className={`chip capitalize px-3 py-1.5 border ${scope === s ? 'bg-brand-500 text-white border-brand-500' : 'border-slate-200 dark:border-slate-800'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-4 flex items-start gap-2">
        <Sparkles className="text-brand-500 mt-1" size={18} />
        <div>
          <div className="font-semibold">AI Summary</div>
          <p className="text-sm text-slate-500">{summary}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Completed per day</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, color: '#fff' }} />
                <Bar dataKey="completed" fill="#3b63f5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Focus minutes</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, color: '#fff' }} />
                <Line type="monotone" dataKey="focus" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-4 md:col-span-2">
          <h3 className="font-semibold mb-3">By category</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={catData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} label>
                  {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
