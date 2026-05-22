import type { Task, TaskFormValues } from '../types/task'
import { apiClient } from './http'

export const taskService = {
  async getTasks() {
    const response = await apiClient.get<Task[]>('/tasks')
    return response.data
  },

  async createTask(values: TaskFormValues) {
    const response = await apiClient.post<Task>('/tasks', values)
    return response.data
  },

  async updateTask(id: string, updates: Partial<TaskFormValues & Pick<Task, 'completed'>>) {
    const response = await apiClient.patch<Task>(`/tasks/${id}`, updates)
    return response.data
  },

  async deleteTask(id: string) {
    const response = await apiClient.delete<string>(`/tasks/${id}`)
    return response.data
  },

  async bulkComplete(ids: string[]) {
    const response = await apiClient.post<Task[]>('/tasks/bulk/complete', ids)
    return response.data
  },

  async bulkDelete(ids: string[]) {
    const response = await apiClient.post<string[]>('/tasks/bulk/delete', ids)
    return response.data
  },
}
