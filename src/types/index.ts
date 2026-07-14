export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type Status = 'todo' | 'in_progress' | 'review' | 'completed'
export type RecurrenceRule = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface Subtask {
  id: string
  title: string
  done: boolean
}

export interface Attachment {
  id: string
  name: string
  dataUrl: string
  size: number
  type: string
}

export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string // ISO
  priority: Priority
  category?: string
  tags: string[]
  status: Status
  notes?: string
  attachments: Attachment[]
  recurrence: RecurrenceRule
  reminderAt?: string // ISO
  subtasks: Subtask[]
  estimatedMinutes?: number
  actualMinutes?: number
  completedAt?: string
  createdAt: string
  updatedAt: string
  assigneeIds?: string[]
  listId?: string
}

export interface Habit {
  id: string
  name: string
  cadence: 'daily' | 'weekly' | 'monthly'
  target: number // times per period
  color: string
  history: string[] // ISO date strings of completions
  createdAt: string
}

export interface FocusSession {
  id: string
  startedAt: string
  endedAt: string
  focusMinutes: number
  breakMinutes: number
  taskId?: string
}

export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  verified: boolean
  createdAt: string
  bio?: string
  phone?: string
  location?: string
  timezone?: string
  birthday?: string // ISO date
  website?: string
  jobTitle?: string
  company?: string
  /** Email the user wants to change to. Requires OTP verification before it becomes `email`. */
  pendingEmail?: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: string
}
