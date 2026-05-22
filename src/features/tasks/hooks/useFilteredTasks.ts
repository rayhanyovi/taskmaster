import { useMemo } from 'react'
import type { Task } from '../../../types/task'
import { useTaskFilterStore } from '../store/taskFilterStore'

/**
 * Derives the visible task list from the global filter store state.
 * Kept as a standalone hook so any component or future view can
 * consume the filtered slice without duplicating the logic.
 */
export function useFilteredTasks(tasks: Task[]) {
  const searchKeyword = useTaskFilterStore((state) => state.searchKeyword)
  const filterStatus = useTaskFilterStore((state) => state.filterStatus)

  return useMemo(() => {
    const query = searchKeyword.trim().toLowerCase()

    return tasks.filter((task) => {
      const matchesSearch =
        query.length === 0 ||
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'pending' && task.status !== 'completed') ||
        (filterStatus === 'completed' && task.status === 'completed')

      return matchesSearch && matchesStatus
    })
  }, [tasks, searchKeyword, filterStatus])
}
