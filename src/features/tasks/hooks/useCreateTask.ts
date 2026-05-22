import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { MockHttpError } from '../../../services/mockApi'
import { taskService } from '../../../services/taskService'
import { taskKeys } from './queryKeys'

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: taskService.createTask,
    onSuccess: async () => {
      toast.success('Task created.')
      await queryClient.invalidateQueries({ queryKey: taskKeys.list() })
    },
    onError: (error) => {
      toast.error(error instanceof MockHttpError ? error.message : 'Failed to create task.')
    },
  })
}
