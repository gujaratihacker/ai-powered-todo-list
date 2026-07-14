import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { DateSelectArg, EventClickArg, EventDropArg, EventInput } from '@fullcalendar/core'
import type { EventResizeDoneArg } from '@fullcalendar/interaction'
import { CalendarPlus, Info } from 'lucide-react'
import { useTasks } from '../stores/tasks'
import { useNotif } from '../stores/notifications'
import type { Priority, Task } from '../types'
import '../styles/fullcalendar.css'

const priorityToColor: Record<Priority, string> = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#3b63f5',
  low: '#94a3b8',
}

export default function CalendarPage() {
  const tasks = useTasks(s => s.tasks)
  const add = useTasks(s => s.add)
  const update = useTasks(s => s.update)
  const remove = useTasks(s => s.remove)
  const push = useNotif(s => s.push)
  const [selected, setSelected] = useState<Task | null>(null)

  const events: EventInput[] = useMemo(() => tasks
    .filter(t => t.dueDate)
    .map(t => {
      const start = new Date(t.dueDate!)
      const end = t.estimatedMinutes
        ? new Date(start.getTime() + t.estimatedMinutes * 60_000)
        : new Date(start.getTime() + 30 * 60_000)
      const done = t.status === 'completed'
      return {
        id: t.id,
        title: t.title,
        start: start.toISOString(),
        end: end.toISOString(),
        backgroundColor: done ? '#94a3b8' : priorityToColor[t.priority],
        borderColor: done ? '#94a3b8' : priorityToColor[t.priority],
        textColor: '#ffffff',
        classNames: done ? ['line-through', 'opacity-70'] : [],
        extendedProps: { status: t.status, priority: t.priority },
      }
    }), [tasks])

  function onDrop(info: EventDropArg) {
    if (!info.event.start) return
    update(info.event.id, { dueDate: info.event.start.toISOString() })
    push({ kind: 'info', title: 'Task rescheduled', body: info.event.title })
  }

  function onResize(info: EventResizeDoneArg) {
    if (!info.event.start || !info.event.end) return
    const mins = Math.round((info.event.end.getTime() - info.event.start.getTime()) / 60_000)
    update(info.event.id, { estimatedMinutes: mins })
  }

  function onSelect(info: DateSelectArg) {
    const title = window.prompt('New task title')?.trim()
    if (!title) return
    const start = info.start
    const end = info.end
    const mins = Math.max(15, Math.round((end.getTime() - start.getTime()) / 60_000))
    add({ title, dueDate: start.toISOString(), estimatedMinutes: mins })
    push({ kind: 'success', title: 'Task added', body: `${title} scheduled` })
  }

  function onClick(info: EventClickArg) {
    const t = tasks.find(x => x.id === info.event.id)
    if (t) setSelected(t)
  }

  const anyScheduled = events.length > 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-slate-500 text-sm">
            Click a slot to add · Drag to reschedule · Resize to change duration · Click an event for details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-2 text-xs">
            <LegendDot color={priorityToColor.urgent} label="Urgent" />
            <LegendDot color={priorityToColor.high} label="High" />
            <LegendDot color={priorityToColor.medium} label="Medium" />
            <LegendDot color={priorityToColor.low} label="Low" />
            <LegendDot color="#94a3b8" label="Completed" />
          </div>
        </div>
      </div>

      {!anyScheduled && (
        <div className="card p-4 flex items-start gap-3 bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800">
          <Info size={18} className="text-brand-500 mt-0.5" />
          <div className="text-sm">
            None of your tasks have a due date, so nothing shows on the calendar yet.
            Click and drag over any time slot to create one, or <Link className="underline" to="/tasks">go to Tasks</Link> and set due dates.
          </div>
        </div>
      )}

      <div className="card p-4 fc-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          buttonText={{ today: 'Today', month: 'Month', week: 'Week', day: 'Day' }}
          events={events}
          editable
          selectable
          selectMirror
          dayMaxEvents={3}
          nowIndicator
          weekNumbers={false}
          firstDay={1}
          height="auto"
          expandRows
          eventDrop={onDrop}
          eventResize={onResize}
          select={onSelect}
          eventClick={onClick}
        />
      </div>

      {selected && (
        <EventDetail
          task={selected}
          onClose={() => setSelected(null)}
          onDelete={() => { remove(selected.id); setSelected(null) }}
          onComplete={() => {
            update(selected.id, {
              status: selected.status === 'completed' ? 'todo' : 'completed',
              completedAt: selected.status === 'completed' ? undefined : new Date().toISOString(),
            })
            setSelected(null)
          }}
        />
      )}
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-slate-500">
      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}

function EventDetail({
  task, onClose, onDelete, onComplete,
}: {
  task: Task
  onClose: () => void
  onDelete: () => void
  onComplete: () => void
}) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-md p-5 space-y-3" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-2">
          <CalendarPlus size={18} className="text-brand-500 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">{task.title}</h3>
            {task.dueDate && <p className="text-xs text-slate-500">{new Date(task.dueDate).toLocaleString()}</p>}
          </div>
          <button className="btn-ghost" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {task.description && <p className="text-sm text-slate-600 dark:text-slate-300">{task.description}</p>}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="chip bg-slate-100 dark:bg-slate-800 capitalize">Priority: {task.priority}</span>
          <span className="chip bg-slate-100 dark:bg-slate-800 capitalize">Status: {task.status.replace('_', ' ')}</span>
          {task.category && <span className="chip bg-slate-100 dark:bg-slate-800">{task.category}</span>}
        </div>
        <div className="flex justify-between pt-2">
          <button className="btn-ghost text-red-500" onClick={onDelete}>Delete</button>
          <div className="flex gap-2">
            <Link to="/tasks" className="btn-outline">Open in tasks</Link>
            <button className="btn-primary" onClick={onComplete}>
              {task.status === 'completed' ? 'Reopen' : 'Mark complete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
