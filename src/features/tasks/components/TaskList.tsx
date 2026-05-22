import type { DragEvent } from 'react'
import type { Task, TaskStatus, TaskViewMode } from '../../../types/task'
import { cn } from '../../../utils/cn'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  onToggleComplete: (task: Task) => void
  onStatusChange: (task: Task, status: TaskStatus) => void
  onOpenDetails: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  viewMode: TaskViewMode
}

const columns: Array<{ status: TaskStatus; label: string; hint: string; className: string }> = [
  { status: 'todo', label: 'To do', hint: 'Planned', className: 'bg-slate-100 dark:bg-[#21262d]' },
  {
    status: 'in_progress',
    label: 'In progress',
    hint: 'Moving',
    className: 'bg-yellow-100 dark:bg-[#2d1f00]',
  },
  { status: 'completed', label: 'Completed', hint: 'Done', className: 'bg-green-100 dark:bg-[#0d2818]' },
]

export function TaskList(props: TaskListProps) {
  const {
    tasks,
    selectedIds,
    onToggleSelect,
    onToggleComplete,
    onStatusChange,
    onOpenDetails,
    onEdit,
    onDelete,
    viewMode,
  } = props
  const isSelectionMode = selectedIds.length > 0

  const renderTask = (task: Task, compact = false) => (
    <div
      key={task.id}
      draggable={!isSelectionMode}
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', task.id)
        event.dataTransfer.effectAllowed = 'move'
      }}
    >
      <TaskItem
        task={task}
        isSelected={selectedIds.includes(task.id)}
        isSelectionMode={isSelectionMode}
        compact={compact}
        onToggleSelect={onToggleSelect}
        onToggleComplete={onToggleComplete}
        onStatusChange={onStatusChange}
        onOpenDetails={onOpenDetails}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  )

  const handleDrop = (event: DragEvent<HTMLElement>, status: TaskStatus) => {
    event.preventDefault()
    const taskId = event.dataTransfer.getData('text/plain')
    const task = tasks.find((item) => item.id === taskId)

    if (task) {
      onStatusChange(task, status)
    }
  }

  if (viewMode === 'kanban') {
    return (
      <div className="grid gap-3 lg:grid-cols-3">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.status)

          return (
            <section
              key={column.status}
              className={cn('min-h-64 rounded-[8px] border border-slate-200 p-3 dark:border-[#30363d]', column.className)}
              onDragOver={(event) => {
                event.preventDefault()
                event.dataTransfer.dropEffect = 'move'
              }}
              onDrop={(event) => handleDrop(event, column.status)}
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-[#e6edf3]">{column.label}</h2>
                  <p className="text-xs text-slate-500 dark:text-[#8b949e]">{column.hint}</p>
                </div>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 dark:bg-[#161b22] dark:text-[#8b949e] dark:ring-[#30363d]">
                  {columnTasks.length}
                </span>
              </div>
              <div
                className={cn(
                  'space-y-3',
                  columnTasks.length === 0 &&
                    'grid min-h-32 place-items-center rounded-[8px] border border-dashed border-slate-200 bg-white/70 text-sm text-slate-400 dark:border-[#30363d] dark:bg-[#161b22]/40 dark:text-[#6e7681]',
                )}
              >
                {columnTasks.length > 0
                  ? columnTasks.map((task) => renderTask(task, true))
                  : 'Drop tasks here'}
              </div>
            </section>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => renderTask(task))}
    </div>
  )
}
