import { DndContext, PointerSensor, useSensor, useSensors, closestCorners, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMemo } from 'react'
import { useTasks } from '../stores/tasks'
import type { Status, Task } from '../types'
import { cn } from '../lib/utils'

const COLUMNS: { key: Status; label: string; tone: string }[] = [
  { key: 'todo', label: 'Todo', tone: 'bg-slate-500' },
  { key: 'in_progress', label: 'In Progress', tone: 'bg-blue-500' },
  { key: 'review', label: 'Review', tone: 'bg-amber-500' },
  { key: 'completed', label: 'Completed', tone: 'bg-emerald-500' },
]

export default function Kanban() {
  const tasks = useTasks(s => s.tasks)
  const setStatus = useTasks(s => s.setStatus)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const grouped = useMemo(() => {
    const m: Record<Status, Task[]> = { todo: [], in_progress: [], review: [], completed: [] }
    tasks.forEach(t => m[t.status].push(t))
    return m
  }, [tasks])

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over) return
    const overId = String(over.id)
    // If dropped on a column container, id will start with "col:"
    if (overId.startsWith('col:')) {
      const status = overId.slice(4) as Status
      setStatus(String(active.id), status)
      return
    }
    const overTask = tasks.find(t => t.id === overId)
    if (overTask) setStatus(String(active.id), overTask.status)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Kanban Board</h1>
        <p className="text-slate-500 text-sm">Drag tasks between columns to change their status.</p>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map(col => (
            <Column key={col.key} col={col} tasks={grouped[col.key]} />
          ))}
        </div>
      </DndContext>
    </div>
  )
}

function Column({ col, tasks }: { col: { key: Status; label: string; tone: string }; tasks: Task[] }) {
  return (
    <div className="card p-3 min-h-[300px]" id={`col:${col.key}`} data-col-id={`col:${col.key}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={cn('w-2 h-2 rounded-full', col.tone)} />
        <h3 className="font-semibold">{col.label}</h3>
        <span className="ml-auto text-xs text-slate-500">{tasks.length}</span>
      </div>
      <SortableContext id={`col:${col.key}`} items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[220px]">
          {tasks.map(t => <SortableCard key={t.id} task={t} />)}
          {tasks.length === 0 && <EmptyDrop status={col.key} />}
        </div>
      </SortableContext>
    </div>
  )
}

function EmptyDrop({ status }: { status: Status }) {
  const { setNodeRef, isOver } = useSortable({ id: `col:${status}` })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center text-xs text-slate-400',
        isOver && 'border-brand-500 bg-brand-50 dark:bg-brand-900/20',
      )}
    >
      Drop here
    </div>
  )
}

function SortableCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        'rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50',
      )}
    >
      <div className="text-sm font-medium">{task.title}</div>
      <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-slate-500">
        <span className="chip bg-slate-100 dark:bg-slate-800">{task.priority}</span>
        {task.category && <span className="chip bg-slate-100 dark:bg-slate-800">{task.category}</span>}
      </div>
    </div>
  )
}
