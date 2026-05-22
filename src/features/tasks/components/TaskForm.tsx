import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Label } from '../../../components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/Select'
import { Spinner } from '../../../components/ui/Spinner'
import { Textarea } from '../../../components/ui/Textarea'
import { TASK_STATUSES, type Task, type TaskFormValues, type TaskStatus } from '../../../types/task'

const taskStatusSchema = z.enum(TASK_STATUSES)

const taskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.'),
  description: z.string(),
  status: taskStatusSchema,
})

const statusOptions: Array<{ value: TaskStatus; label: string }> = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
]

interface TaskFormProps {
  task?: Task | null
  isSubmitting: boolean
  isDeleting?: boolean
  onCancel: () => void
  onSubmit: (values: TaskFormValues) => void
  onDelete?: () => void
}

export function TaskForm({
  task,
  isSubmitting,
  isDeleting = false,
  onCancel,
  onSubmit,
  onDelete,
}: TaskFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? 'todo',
    },
  })

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {task ? 'Task details' : 'Create a new task'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {task
            ? 'Review the task, update its fields, or remove it from the board.'
            : 'Capture the next task for your queue.'}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="task-title">Title</Label>
        <Input
          id="task-title"
          placeholder="Write release notes"
          {...register('title')}
        />
        {errors.title ? <span className="text-xs text-red-500">{errors.title.message}</span> : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="task-description">Description</Label>
        <Textarea
          id="task-description"
          rows={4}
          className="resize-none"
          placeholder="Optional details"
          {...register('description')}
        />
        {errors.description ? (
          <span className="text-xs text-red-500">{errors.description.message}</span>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label>Status</Label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.status ? <span className="text-xs text-red-500">{errors.status.message}</span> : null}
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        {task && onDelete ? (
          <Button
            variant="ghost"
            className="justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
            disabled={isSubmitting || isDeleting}
            onClick={onDelete}
          >
            {isDeleting ? <Spinner /> : <Trash2 className="h-4 w-4" />}
            Delete
          </Button>
        ) : (
          <span />
        )}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" disabled={isSubmitting || isDeleting} onClick={onCancel}>
            Cancel
          </Button>
          <Button className="gap-2" type="submit" disabled={isSubmitting || isDeleting}>
            {isSubmitting ? <Spinner /> : null}
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </div>
    </form>
  )
}
