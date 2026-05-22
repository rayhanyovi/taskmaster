import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { MockHttpError } from '../../../services/mockApi'
import type { Task } from '../../../types/task'
import { taskService } from '../../../services/taskService'
import { taskKeys } from './queryKeys'

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: taskService.deleteTask,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.list() })
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.list())

      queryClient.setQueryData<Task[]>(taskKeys.list(), (tasks = []) =>
        tasks.filter((task) => task.id !== id),
      )

      return { previousTasks }
    },
    onError: (error, _id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.list(), context.previousTasks)
      }

      toast.error(error instanceof MockHttpError ? error.message : 'Failed to delete task.')
    },
    onSuccess: () => {
      toast.success('Task deleted.')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: taskKeys.list() })
    },
  })
}
