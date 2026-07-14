import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { CheckCircle2, Clock, AlertCircle, ListChecks, Sparkles } from 'lucide-react'
import { useTasks } from '../stores/tasks'
import { useFocus } from '../stores/focus'
import { useGami } from '../stores/gamification'
import { ai } from '../ai'

const COLORS = ['#3b63f5', '#8b5cf6', '#f59e0b', '#10b981']

export default function Dashboard() {
  const tasks = useTasks(s => s.tasks)
  const sessions = useFocus(s => s.sessions)
  const { xp, level } = useGami()
  const [suggestions, setSuggestions] = useState<string[]>([])

  const stats = useMemo(() => {
    const now = new Date()
    const done = tasks.filter(t => t.status === 'completed').length
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed').length
    const pending = tasks.filter(t => t.status !== 'completed').length
    const completionRate = tasks.length ? Math.round((done / tasks.length) * 100) : 0
    return { total: tasks.length, done, pending, overdue, completionRate }
  }, [tasks])

  const weekly = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0, 0, 0, 0)
      const key = d.toISOString().slice(0, 10)
      const created = tasks.filter(t => t.createdAt.slice(0, 10) === key).length
      const completed = tasks.filter(t => t.completedAt?.slice(0, 10) === key).length
      return { day: d.toLocaleDateString(undefined, { weekday: 'short' }), created, completed }
    })
    return days
  }, [tasks])

  const byPriority = useMemo(() => {
    const p = { low: 0, medium: 0, high: 0, urgent: 0 }
    tasks.forEach(t => { p[t.priority]++ })
    return Object.entries(p).map(([name, value]) => ({ name, value }))
  }, [tasks])

  const focusMinutes = sessions.reduce((a, s) => a + s.focusMinutes, 0)

  useEffect(() => { ai.suggestions(tasks).then(setSuggestions) }, [tasks])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Good {greeting()}</h1>
        <p className="text-slate-500 text-sm">
          Level {level()} · {xp} XP · Focus this session: {focusMinutes}m
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<ListChecks />} label="Total" value={stats.total} tone="bg-brand-500" />
        <StatCard icon={<CheckCircle2 />} label="Completed" value={stats.done} tone="bg-emerald-500" />
        <StatCard icon={<Clock />} label="Pending" value={stats.pending} tone="bg-amber-500" />
        <StatCard icon={<AlertCircle />} label="Overdue" value={stats.overdue} tone="bg-red-500" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-4 md:col-span-2">
          <h3 className="font-semibold mb-3">Weekly Progress</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, color: '#fff' }} />
                <Line type="monotone" dataKey="created" stroke="#8b5cf6" strokeWidth={2} />
                <Line type="monotone" dataKey="completed" stroke="#3b63f5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold mb-3">By Priority</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byPriority} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
                  {byPriority.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-brand-500" size={18} />
            <h3 className="font-semibold">AI Suggestions</h3>
          </div>
          <ul className="text-sm space-y-2">
            {suggestions.map((s, i) => (
              <li key={i} className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3">{s}</li>
            ))}
          </ul>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold mb-2">Productivity Score</h3>
          <div className="text-5xl font-extrabold text-brand-500">{stats.completionRate}%</div>
          <p className="text-sm text-slate-500 mt-1">Completion rate across all tasks.</p>
          <Link to="/analytics" className="btn-outline mt-4">View analytics</Link>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: string }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg text-white grid place-items-center ${tone}`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
}
