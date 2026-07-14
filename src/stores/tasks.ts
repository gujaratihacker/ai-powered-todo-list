import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Priority, Status, Task } from '../types'
import { todayISO, uid } from '../lib/utils'

interface TaskState {
  tasks: Task[]
  add: (partial: Partial<Task> & { title: string }) => Task
  addMany: (partials: Array<Partial<Task> & { title: string }>) => Task[]
  update: (id: string, patch: Partial<Task>) => void
  remove: (id: string) => void
  toggleComplete: (id: string) => void
  setStatus: (id: string, status: Status) => void
  setPriority: (id: string, priority: Priority) => void
  reorder: (ids: string[]) => void
  clearCompleted: () => void
}

function seedTasks(): Task[] {
  const now = new Date()
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1); tomorrow.setHours(17, 0, 0, 0)
  const nextWeek = new Date(now); nextWeek.setDate(now.getDate() + 6)
  return [
    {
      id: uid('t'), title: 'Welcome to Aurora — try the AI quick-add above',
      description: 'Type things like "Tomorrow 5pm call John and buy milk"',
      priority: 'high', status: 'todo', tags: ['tutorial'], attachments: [], subtasks: [],
      recurrence: 'none', createdAt: todayISO(), updatedAt: todayISO(), estimatedMinutes: 5,
      category: 'General',
    },
    {
      id: uid('t'), title: 'Review weekly plan',
      priority: 'medium', status: 'in_progress', tags: ['work'], attachments: [], subtasks: [
        { id: uid('s'), title: 'Check dashboard', done: true },
        { id: uid('s'), title: 'Move overdue tasks', done: false },
      ],
      recurrence: 'weekly', dueDate: tomorrow.toISOString(), createdAt: todayISO(), updatedAt: todayISO(),
      estimatedMinutes: 20, category: 'Work',
    },
    {
      id: uid('t'), title: 'Buy groceries',
      priority: 'low', status: 'todo', tags: ['home'], attachments: [], subtasks: [],
      recurrence: 'none', dueDate: nextWeek.toISOString(), createdAt: todayISO(), updatedAt: todayISO(),
      estimatedMinutes: 30, category: 'Personal',
    },
  ]
}

export const useTasks = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: seedTasks(),
      add(partial) {
        const task: Task = {
          id: uid('t'),
          priority: 'medium',
          status: 'todo',
          tags: [],
          attachments: [],
          subtasks: [],
          recurrence: 'none',
          createdAt: todayISO(),
          updatedAt: todayISO(),
          ...partial,
        }
        set({ tasks: [task, ...get().tasks] })
        return task
      },
      addMany(partials) {
        const now = todayISO()
        const created: Task[] = partials.map(p => ({
          id: uid('t'), priority: 'medium', status: 'todo', tags: [], attachments: [], subtasks: [],
          recurrence: 'none', createdAt: now, updatedAt: now, ...p,
        }))
        set({ tasks: [...created, ...get().tasks] })
        return created
      },
      update(id, patch) {
        set({
          tasks: get().tasks.map(t => (t.id === id ? { ...t, ...patch, updatedAt: todayISO() } : t)),
        })
      },
      remove(id) {
        set({ tasks: get().tasks.filter(t => t.id !== id) })
      },
      toggleComplete(id) {
        set({
          tasks: get().tasks.map(t =>
            t.id === id
              ? {
                  ...t,
                  status: t.status === 'completed' ? 'todo' : 'completed',
                  completedAt: t.status === 'completed' ? undefined : todayISO(),
                  updatedAt: todayISO(),
                }
              : t,
          ),
        })
      },
      setStatus(id, status) {
        set({
          tasks: get().tasks.map(t =>
            t.id === id
              ? {
                  ...t,
                  status,
                  completedAt: status === 'completed' ? todayISO() : undefined,
                  updatedAt: todayISO(),
                }
              : t,
          ),
        })
      },
      setPriority(id, priority) {
        set({ tasks: get().tasks.map(t => (t.id === id ? { ...t, priority, updatedAt: todayISO() } : t)) })
      },
      reorder(ids) {
        const map = new Map(get().tasks.map(t => [t.id, t]))
        set({ tasks: ids.map(i => map.get(i)!).filter(Boolean) })
      },
      clearCompleted() {
        set({ tasks: get().tasks.filter(t => t.status !== 'completed') })
      },
    }),
    { name: 'aurora.tasks' },
  ),
)
