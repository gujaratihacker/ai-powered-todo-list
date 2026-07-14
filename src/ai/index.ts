// AI service — provider-agnostic. Currently a local stub so the UI works
// offline and on Netlify without any API keys. Swap `stubProvider` for
// `openaiProvider` or `geminiProvider` when a key is available.

import type { Priority, Task } from '../types'

export interface ParsedTask {
  title: string
  description?: string
  dueDate?: string
  priority: Priority
  tags: string[]
  category?: string
  estimatedMinutes?: number
}

export interface AIProvider {
  parseNaturalLanguage(input: string): Promise<ParsedTask[]>
  prioritize(tasks: Task[]): Promise<Array<{ id: string; priority: Priority; reason: string }>>
  dailyPlan(tasks: Task[], date: Date): Promise<Array<{ id: string; startTime: string; endTime: string }>>
  weeklyPlan(tasks: Task[]): Promise<Array<{ id: string; day: string }>>
  breakdown(task: Task): Promise<string[]>
  suggestions(tasks: Task[]): Promise<string[]>
  summarize(tasks: Task[], scope: 'day' | 'week' | 'month'): Promise<string>
}

// -------- Stub provider (regex + heuristics) --------

const PRIORITY_WORDS: Record<Priority, string[]> = {
  urgent: ['urgent', 'asap', 'immediately', 'now'],
  high: ['important', 'high', 'critical', 'must'],
  medium: ['soon', 'medium'],
  low: ['later', 'someday', 'low'],
}

function detectPriority(s: string): Priority {
  const lower = s.toLowerCase()
  for (const p of ['urgent', 'high', 'medium', 'low'] as Priority[]) {
    if (PRIORITY_WORDS[p].some(w => lower.includes(w))) return p
  }
  return 'medium'
}

function detectDueDate(input: string): string | undefined {
  const lower = input.toLowerCase()
  const now = new Date()
  const target = new Date(now)

  if (/\btomorrow\b/.test(lower)) target.setDate(now.getDate() + 1)
  else if (/\btonight\b/.test(lower)) target.setHours(20, 0, 0, 0)
  else if (/\btoday\b/.test(lower)) { /* keep today */ }
  else if (/\bnext week\b/.test(lower)) target.setDate(now.getDate() + 7)
  else if (/\bmonday\b/.test(lower)) target.setDate(now.getDate() + ((1 - now.getDay() + 7) % 7 || 7))
  else if (/\btuesday\b/.test(lower)) target.setDate(now.getDate() + ((2 - now.getDay() + 7) % 7 || 7))
  else if (/\bwednesday\b/.test(lower)) target.setDate(now.getDate() + ((3 - now.getDay() + 7) % 7 || 7))
  else if (/\bthursday\b/.test(lower)) target.setDate(now.getDate() + ((4 - now.getDay() + 7) % 7 || 7))
  else if (/\bfriday\b/.test(lower)) target.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7 || 7))
  else if (/\bsaturday\b/.test(lower)) target.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7 || 7))
  else if (/\bsunday\b/.test(lower)) target.setDate(now.getDate() + ((0 - now.getDay() + 7) % 7 || 7))
  else return undefined

  // Time e.g. "5 PM", "5pm", "17:30"
  const timeMatch = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
  if (timeMatch) {
    let h = parseInt(timeMatch[1], 10)
    const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0
    const ap = timeMatch[3]?.toLowerCase()
    if (ap === 'pm' && h < 12) h += 12
    if (ap === 'am' && h === 12) h = 0
    if (h >= 0 && h <= 23) target.setHours(h, m, 0, 0)
  }
  return target.toISOString()
}

function extractTags(s: string): string[] {
  return Array.from(s.matchAll(/#(\w+)/g)).map(m => m[1])
}

const stubProvider: AIProvider = {
  async parseNaturalLanguage(input) {
    // Split on " and " / commas — each fragment becomes a task.
    const parts = input
      .split(/\s+and\s+|,\s*/i)
      .map(s => s.trim())
      .filter(Boolean)

    const dueDate = detectDueDate(input) // shared date if present
    return parts.map(p => ({
      title: p.replace(/#\w+/g, '').replace(/\b(tomorrow|today|tonight|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '').replace(/\d{1,2}(:\d{2})?\s*(am|pm)?/i, '').trim() || p,
      priority: detectPriority(p),
      tags: extractTags(p),
      dueDate,
    }))
  },

  async prioritize(tasks) {
    return tasks.map(t => {
      const overdue = t.dueDate && new Date(t.dueDate) < new Date()
      const soon = t.dueDate && new Date(t.dueDate).getTime() - Date.now() < 1000 * 60 * 60 * 24
      const priority: Priority = overdue ? 'urgent' : soon ? 'high' : t.priority
      return { id: t.id, priority, reason: overdue ? 'Overdue' : soon ? 'Due within 24h' : 'Kept as-is' }
    })
  },

  async dailyPlan(tasks, date) {
    const workStart = new Date(date); workStart.setHours(9, 0, 0, 0)
    const results: Array<{ id: string; startTime: string; endTime: string }> = []
    let cursor = workStart
    for (const t of tasks) {
      const dur = t.estimatedMinutes ?? 30
      const end = new Date(cursor.getTime() + dur * 60_000)
      results.push({ id: t.id, startTime: cursor.toISOString(), endTime: end.toISOString() })
      cursor = new Date(end.getTime() + 10 * 60_000) // 10 min buffer
    }
    return results
  },

  async weeklyPlan(tasks) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    return tasks.map((t, i) => ({ id: t.id, day: days[i % days.length] }))
  },

  async breakdown(task) {
    return [
      `Outline goals for "${task.title}"`,
      'Gather any required resources',
      'Do the first concrete action',
      'Review progress',
      'Wrap up and mark complete',
    ]
  },

  async suggestions(tasks) {
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length
    const s: string[] = []
    if (overdue) s.push(`You have ${overdue} overdue task${overdue === 1 ? '' : 's'} — tackle them first.`)
    s.push('Batch similar tasks together to reduce context switching.')
    s.push('Try a 25/5 Pomodoro on your highest-priority task.')
    return s
  },

  async summarize(tasks, scope) {
    const done = tasks.filter(t => t.status === 'completed').length
    return `In this ${scope} you completed ${done} of ${tasks.length} tasks.`
  },
}

export const ai: AIProvider = stubProvider
