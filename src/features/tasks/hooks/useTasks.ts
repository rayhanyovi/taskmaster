import { useQuery } from '@tanstack/react-query'
import { taskService } from '../../../services/taskService'
import { taskKeys } from './queryKeys'

export function useTasks() {
  return useQuery({
    queryKey: taskKeys.list(),
    queryFn: taskService.getTasks,
    retry: 0,
  })
}
