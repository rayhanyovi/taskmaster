export const TASK_STATUSES = ['todo', 'in_progress', 'completed'] as const

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  completed: boolean
  createdAt: string
  updatedAt: string
}

export type TaskFilterStatus = 'all' | 'pending' | 'completed'
export type TaskViewMode = 'kanban' | 'list'
export type TaskStatus = (typeof TASK_STATUSES)[number]

export interface TaskFormValues {
  title: string
  description: string
  status: TaskStatus
}
