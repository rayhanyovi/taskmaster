import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { MockHttpError } from '../../../services/mockApi'
import type { Task } from '../../../types/task'
import { taskService } from '../../../services/taskService'
import { taskKeys } from './queryKeys'

interface UpdateTaskPayload {
  id: string
  data: Partial<Pick<Task, 'title' | 'description' | 'status' | 'completed'>>
  successMessage?: string
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: UpdateTaskPayload) => taskService.updateTask(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.list() })
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.list())

      queryClient.setQueryData<Task[]>(taskKeys.list(), (tasks = []) =>
        tasks.map((task) =>
          task.id === id
            ? {
                ...task,
                ...data,
                completed: data.status ? data.status === 'completed' : data.completed ?? task.completed,
                updatedAt: new Date().toISOString(),
              }
            : task,
        ),
      )

      return { previousTasks }
    },
    onError: (error, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.list(), context.previousTasks)
      }

      const fallbackMessage =
        typeof variables.data.completed === 'boolean'
          || typeof variables.data.status === 'string'
          ? 'Failed to update task status.'
          : 'Failed to update task.'

      toast.error(error instanceof MockHttpError ? error.message : fallbackMessage)
    },
    onSuccess: (_data, variables) => {
      if (typeof variables.data.completed !== 'boolean' && typeof variables.data.status !== 'string') {
        toast.success(variables.successMessage ?? 'Task updated.')
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: taskKeys.list() })
    },
  })
}
