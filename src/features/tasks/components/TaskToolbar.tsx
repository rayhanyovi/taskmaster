import { Columns3, List, Plus } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent } from '../../../components/ui/Card'
import type { Task, TaskViewMode } from '../../../types/task'
import { cn } from '../../../utils/cn'
import { TaskFilterTabs } from './TaskFilterTabs'
import { TaskSearchInput } from './TaskSearchInput'
import { useTaskFilterStore } from '../store/taskFilterStore'

interface TaskToolbarProps {
  tasks: Task[]
  visibleCount: number
  onCreate: () => void
}

const viewModes: Array<{
  label: string
  value: TaskViewMode
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}> = [
  { label: 'Kanban', value: 'kanban', Icon: Columns3 },
  { label: 'List', value: 'list', Icon: List },
]

export function TaskToolbar({ tasks, visibleCount, onCreate }: TaskToolbarProps) {
  const viewMode = useTaskFilterStore((state) => state.viewMode)
  const setViewMode = useTaskFilterStore((state) => state.setViewMode)

  return (
    <Card className="animate-fade-in border-slate-200/80 bg-white/88 backdrop-blur-sm">
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <TaskSearchInput />
          <Button className="gap-2 sm:shrink-0" onClick={onCreate}>
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex gap-1 rounded-[8px] bg-slate-100/90 p-1.5">
              {viewModes.map((mode) => {
                const active = viewMode === mode.value
                const Icon = mode.Icon

                return (
                  <button
                    key={mode.value}
                    type="button"
                    aria-label={`${mode.label} view`}
                    title={`${mode.label} view`}
                    className={cn(
                      'grid h-9 w-10 place-items-center rounded-md transition-all duration-200',
                      active
                        ? 'bg-white font-medium text-slate-950 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700',
                    )}
                    onClick={() => setViewMode(mode.value)}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                )
              })}
            </div>
            <TaskFilterTabs tasks={tasks} />
          </div>
          <p className="text-sm font-medium text-slate-500">
            Showing {visibleCount} of {tasks.length} tasks
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
