import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { MockHttpError } from '../../../services/mockApi'
import type { Task } from '../../../types/task'
import { taskService } from '../../../services/taskService'
import { taskKeys } from './queryKeys'

export function useBulkComplete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: taskService.bulkComplete,
    onSuccess: async () => {
      toast.success('Selected tasks completed.')
      await queryClient.invalidateQueries({ queryKey: taskKeys.list() })
    },
    onError: (error) => {
      toast.error(
        error instanceof MockHttpError ? error.message : 'Failed to complete selected tasks.',
      )
    },
  })
}

export function useBulkDelete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: taskService.bulkDelete,
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.list() })
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.list())
      const idSet = new Set(ids)

      queryClient.setQueryData<Task[]>(taskKeys.list(), (tasks = []) =>
        tasks.filter((task) => !idSet.has(task.id)),
      )

      return { previousTasks }
    },
    onError: (error, _ids, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.list(), context.previousTasks)
      }

      toast.error(
        error instanceof MockHttpError ? error.message : 'Failed to delete selected tasks.',
      )
    },
    onSuccess: () => {
      toast.success('Selected tasks deleted.')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: taskKeys.list() })
    },
  })
}
