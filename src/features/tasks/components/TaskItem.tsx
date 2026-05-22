import { Check, Circle, MoreHorizontal, Pencil, Play, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import { Badge } from '../../../components/ui/Badge'
import { Checkbox } from '../../../components/ui/Checkbox'
import type { Task, TaskStatus } from '../../../types/task'
import { cn } from '../../../utils/cn'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent } from '../../../components/ui/Card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/DropdownMenu'

interface TaskItemProps {
  task: Task
  isSelected: boolean
  isSelectionMode: boolean
  compact?: boolean
  onToggleSelect: (id: string) => void
  onToggleComplete: (task: Task) => void
  onStatusChange: (task: Task, status: TaskStatus) => void
  onOpenDetails: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

const statusMeta: Record<TaskStatus, { label: string; className: string }> = {
  todo: {
    label: 'To do',
    className: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-[#21262d] dark:text-[#8b949e] dark:ring-[#30363d]',
  },
  in_progress: {
    label: 'In progress',
    className: 'bg-yellow-100 text-yellow-800 ring-yellow-200 dark:bg-[#2d1f00] dark:text-[#d29922] dark:ring-[#5c3d00]',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-700 ring-green-200 dark:bg-[#0d2818] dark:text-[#3fb950] dark:ring-[#1f4b2e]',
  },
}

export function TaskItem({
  task,
  isSelected,
  isSelectionMode,
  compact = false,
  onToggleSelect,
  onToggleComplete,
  onStatusChange,
  onOpenDetails,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const status = statusMeta[task.status]
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const longPressTimer = useRef<number | null>(null)
  const suppressNextClick = useRef(false)

  const clearLongPress = () => {
    if (!longPressTimer.current) return
    window.clearTimeout(longPressTimer.current)
    longPressTimer.current = null
  }

  useEffect(() => clearLongPress, [])

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    const target = event.target as HTMLElement

    if (target.closest('button, input')) return

    longPressTimer.current = window.setTimeout(() => {
      onToggleSelect(task.id)
      suppressNextClick.current = true
      longPressTimer.current = null
    }, 450)
  }

  const handleCardClick = (event: MouseEvent<HTMLElement>) => {
    if (suppressNextClick.current) {
      suppressNextClick.current = false
      return
    }

    const target = event.target as HTMLElement
    if (target.closest('button, input')) return

    if (isSelectionMode) {
      onToggleSelect(task.id)
      return
    }

    onOpenDetails(task)
  }

  const handleStatusControlClick = () => {
    if (task.status === 'todo') {
      setShowStatusMenu((current) => !current)
      return
    }

    onToggleComplete(task)
  }

  const handleStatusMenuSelect = (nextStatus: TaskStatus) => {
    setShowStatusMenu(false)
    onStatusChange(task, nextStatus)
  }

  return (
    <Card
      className={cn(
        'animate-slide-up-in bg-white/95 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_36px_-24px_rgba(15,23,42,0.45)] dark:bg-[#161b22]/95 dark:hover:border-[#58a6ff]/40 dark:hover:shadow-[0_18px_36px_-24px_rgba(0,0,0,0.6)]',
        isSelected ? 'border-sky-300 ring-2 ring-sky-100 dark:border-[#58a6ff]/60 dark:ring-[#58a6ff]/20' : 'border-slate-200 dark:border-[#30363d]',
      )}
      onPointerDown={handlePointerDown}
      onPointerUp={clearLongPress}
      onPointerLeave={clearLongPress}
      onPointerCancel={clearLongPress}
      onClick={handleCardClick}
    >
      <CardContent className="flex items-start gap-3">
        {isSelectionMode ? (
          <Checkbox
            aria-label={`Select ${task.title}`}
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(task.id)}
            className="mt-1"
          />
        ) : (
          <div className="relative">
            <button
              type="button"
              aria-label={
                task.status === 'todo'
                  ? `Choose status for ${task.title}`
                  : task.status === 'completed'
                    ? `Mark ${task.title} in progress`
                    : `Mark ${task.title} complete`
              }
              onClick={handleStatusControlClick}
              className={cn(
                'mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200',
                task.status === 'completed'
                  ? 'border-green-600 bg-green-600 text-white dark:border-[#3fb950] dark:bg-[#3fb950]'
                  : 'border-slate-300 bg-white text-transparent hover:border-yellow-400 dark:border-[#30363d] dark:bg-[#161b22] dark:hover:border-yellow-500',
              )}
            >
              <Check className="h-3 w-3" />
            </button>

            {showStatusMenu ? (
              <div className="absolute left-0 top-7 z-20 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg animate-pop-in dark:border-[#30363d] dark:bg-[#21262d]">
                <Button
                  variant="ghost"
                  className="h-9 w-full justify-start gap-2 rounded-none px-3 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800"
                  onClick={() => handleStatusMenuSelect('in_progress')}
                >
                  <Play className="h-4 w-4" />
                  In progress
                </Button>
                <Button
                  variant="ghost"
                  className="h-9 w-full justify-start gap-2 rounded-none px-3 text-green-700 hover:bg-green-50 hover:text-green-800"
                  onClick={() => handleStatusMenuSelect('completed')}
                >
                  <Check className="h-4 w-4" />
                  Complete
                </Button>
              </div>
            ) : null}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3
                className={cn(
                  'truncate text-sm font-semibold text-slate-950 dark:text-[#e6edf3]',
                  task.status === 'completed' && 'text-slate-400 line-through dark:text-[#6e7681]',
                )}
              >
                {task.title}
              </h3>
              {task.description ? (
                <p
                  className={cn(
                    'mt-2 text-sm leading-6 text-slate-500 dark:text-[#8b949e]',
                    compact &&
                      'line-clamp-3 overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical]',
                  )}
                >
                  {task.description}
                </p>
              ) : null}
              <p className="mt-3 text-xs text-slate-400 dark:text-[#6e7681]">
                Updated {new Date(task.updatedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex shrink-0 items-start gap-2">
              {!compact ? (
                <Badge
                  className={cn(
                    status.className,
                  )}
                >
                  {status.label}
                </Badge>
              ) : null}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="grid h-8 w-8 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-[#8b949e] dark:hover:bg-[#21262d] dark:hover:text-[#e6edf3]"
                    aria-label={`More actions for ${task.title}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48"
                  onClick={(event) => event.stopPropagation()}
                >
                  {task.status !== 'todo' ? (
                    <DropdownMenuItem
                      className="text-slate-600 focus:bg-slate-50 focus:text-slate-800"
                      aria-label={`Change ${task.title} to to do`}
                      onSelect={() => onStatusChange(task, 'todo')}
                    >
                      <Circle className="h-4 w-4 text-slate-500" />
                      <span>Change to To do</span>
                    </DropdownMenuItem>
                  ) : null}
                  {task.status !== 'in_progress' ? (
                    <DropdownMenuItem
                      className="text-yellow-700 focus:bg-yellow-50 focus:text-yellow-800"
                      aria-label={`Change ${task.title} to in progress`}
                      onSelect={() => onStatusChange(task, 'in_progress')}
                    >
                      <Play className="h-4 w-4 text-yellow-700" />
                      <span>Change to In progress</span>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-blue-600 focus:bg-blue-50 focus:text-blue-700"
                    aria-label={`Edit ${task.title}`}
                    onSelect={() => onEdit(task)}
                  >
                    <Pencil className="h-4 w-4 text-sky-600" />
                    <span className="text-sky-600">Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 focus:bg-red-50 focus:text-red-700"
                    aria-label={`Delete ${task.title}`}
                    onSelect={() => onDelete(task)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                    <span className="text-red-600">Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
