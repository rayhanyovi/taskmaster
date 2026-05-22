import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import type { Task, TaskFormValues } from '../../../types/task'
import { useCreateTask } from '../hooks/useCreateTask'
import { useDeleteTask } from '../hooks/useDeleteTask'
import { useUpdateTask } from '../hooks/useUpdateTask'
import { TaskForm } from './TaskForm'

interface TaskFormModalProps {
  open: boolean
  task: Task | null
  onClose: () => void
}

export function TaskFormModal({ open, task, onClose }: TaskFormModalProps) {
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const isSubmitting = createTask.isPending || updateTask.isPending
  const isDeleting = deleteTask.isPending
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const handleSubmit = async (values: TaskFormValues) => {
    try {
      if (task) {
        await updateTask.mutateAsync({
          id: task.id,
          data: values,
          successMessage: 'Task updated.',
        })
        onClose()
        return
      }

      await createTask.mutateAsync(values)
      onClose()
    } catch {
      // Mutation hooks already surface user-facing feedback; keep the modal open for correction/retry.
    }
  }

  const handleDelete = async () => {
    if (!task) return

    try {
      await deleteTask.mutateAsync(task.id)
      setConfirmDeleteOpen(false)
      onClose()
    } catch {
      // Mutation hooks already surface user-facing feedback; keep the modal open for retry.
    }
  }

  const handleClose = () => {
    setConfirmDeleteOpen(false)
    onClose()
  }

  return (
    <>
      <Modal open={open} title={task ? 'Task details' : 'Create task'} onClose={handleClose}>
        <TaskForm
          key={task?.id ?? 'new-task'}
          task={task}
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
          onCancel={handleClose}
          onSubmit={handleSubmit}
          onDelete={task ? () => setConfirmDeleteOpen(true) : undefined}
        />
      </Modal>
      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete task?"
        description={task ? `This will permanently delete "${task.title}".` : 'This task will be deleted.'}
        isConfirming={isDeleting}
        onOpenChange={setConfirmDeleteOpen}
        onConfirm={() => void handleDelete()}
      />
    </>
  )
}
