import type { TaskFilterStatus, Task } from '../../../types/task'
import { cn } from '../../../utils/cn'
import { useTaskFilterStore } from '../store/taskFilterStore'

interface TaskFilterTabsProps {
  tasks: Task[]
}

const tabs: Array<{ label: string; value: TaskFilterStatus }> = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
]

export function TaskFilterTabs({ tasks }: TaskFilterTabsProps) {
  const filterStatus = useTaskFilterStore((state) => state.filterStatus)
  const setFilterStatus = useTaskFilterStore((state) => state.setFilterStatus)

  const getCount = (status: TaskFilterStatus) => {
    if (status === 'all') return tasks.length
    if (status === 'pending') return tasks.filter((task) => task.status !== 'completed').length
    return tasks.filter((task) => task.status === 'completed').length
  }

  return (
    <div className="flex gap-1 rounded-2xl bg-slate-100/90 p-1.5">
      {tabs.map((tab) => {
        const active = filterStatus === tab.value
        return (
          <button
            key={tab.value}
            type="button"
            className={cn(
              'rounded-xl px-3 py-2 text-sm transition-all duration-200',
              active
                ? 'bg-white font-medium text-slate-950 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            )}
            onClick={() => setFilterStatus(tab.value)}
          >
            {tab.label} ({getCount(tab.value)})
          </button>
        )
      })}
    </div>
  )
}
