import { useEffect, useState } from 'react'
import { MockHttpError } from '../../../services/mockApi'
import { useAuth } from '../../auth/hooks/useAuth'
import { useTaskFilterStore } from '../store/taskFilterStore'
import { useTaskSelectionStore } from '../store/taskSelectionStore'
import type { Task, TaskStatus } from '../../../types/task'
import { useBulkComplete, useBulkDelete } from './useBulkActions'
import { useDeleteTask } from './useDeleteTask'
import { useFilteredTasks } from './useFilteredTasks'
import { useTasks } from './useTasks'
import { useUpdateTask } from './useUpdateTask'

/**
 * Orchestrates all state, derived values, and action handlers for the
 * task workspace. The component layer reads from this hook and renders —
 * it owns no business logic of its own.
 */
export function useTaskWorkspace() {
  // ── Server state ──────────────────────────────────────────────────────────
  const { data: tasks = [], isLoading, isError, isRefetchError, error, refetch } = useTasks()

  // ── Mutations ─────────────────────────────────────────────────────────────
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const bulkComplete = useBulkComplete()
  const bulkDelete = useBulkDelete()

  // ── Global UI state ───────────────────────────────────────────────────────
  const filterStatus = useTaskFilterStore((state) => state.filterStatus)
  const searchKeyword = useTaskFilterStore((state) => state.searchKeyword)
  const viewMode = useTaskFilterStore((state) => state.viewMode)

  const selectedIds = useTaskSelectionStore((state) => state.selectedIds)
  const toggleSelection = useTaskSelectionStore((state) => state.toggleSelection)
  const selectVisible = useTaskSelectionStore((state) => state.selectVisible)
  const deselectAll = useTaskSelectionStore((state) => state.deselectAll)

  // ── Auth ──────────────────────────────────────────────────────────────────
  const { session, logout } = useAuth()

  // ── Local UI state ────────────────────────────────────────────────────────
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskPendingDelete, setTaskPendingDelete] = useState<Task | null>(null)
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)

  // ── Derived values ────────────────────────────────────────────────────────
  const filteredTasks = useFilteredTasks(tasks)
  const visibleIds = filteredTasks.map((t) => t.id)

  const isWorking =
    updateTask.isPending || deleteTask.isPending || bulkComplete.isPending || bulkDelete.isPending

  const showTaskError = isError || isRefetchError
  const errorMessage = error instanceof MockHttpError ? error.message : 'Unknown error.'

  const avatarInitial = session?.email?.charAt(0).toUpperCase() ?? 'T'
  const sessionDateLabel = session?.loggedInAt
    ? new Date(session.loggedInAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  // ── Side-effects ──────────────────────────────────────────────────────────
  useEffect(() => {
    deselectAll()
  }, [deselectAll, filterStatus, searchKeyword])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingTask(null)
    setIsFormOpen(true)
  }

  const openEdit = (task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingTask(null)
  }

  const requestDelete = (task: Task) => {
    setTaskPendingDelete(task)
  }

  const cancelDelete = () => {
    setTaskPendingDelete(null)
  }

  const confirmDelete = async () => {
    if (!taskPendingDelete) return
    try {
      await deleteTask.mutateAsync(taskPendingDelete.id)
      setTaskPendingDelete(null)
    } catch {
      // Mutation hook shows toast; keep dialog open for retry.
    }
  }

  const toggleComplete = (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'completed' ? 'in_progress' : 'completed'
    updateTask.mutate({ id: task.id, data: { status: nextStatus } })
  }

  const changeStatus = (task: Task, status: TaskStatus) => {
    if (task.status === status) return
    updateTask.mutate({ id: task.id, data: { status } })
  }

  const bulkCompleteSelected = async () => {
    await bulkComplete.mutateAsync(selectedIds)
    deselectAll()
  }

  const bulkDeleteSelected = async () => {
    try {
      await bulkDelete.mutateAsync(selectedIds)
      setBulkDeleteConfirmOpen(false)
      deselectAll()
    } catch {
      // Mutation hook shows toast; keep dialog open for retry.
    }
  }

  return {
    // Data
    tasks,
    filteredTasks,
    visibleIds,
    // Async state
    isLoading,
    showTaskError,
    errorMessage,
    isWorking,
    refetch,
    // Auth
    session,
    avatarInitial,
    sessionDateLabel,
    logout,
    // UI state
    viewMode,
    selectedIds,
    isFormOpen,
    editingTask,
    taskPendingDelete,
    bulkDeleteConfirmOpen,
    setBulkDeleteConfirmOpen,
    // Selection
    toggleSelection,
    selectVisible,
    deselectAll,
    // Mutation flags (for confirm dialogs)
    isDeleting: deleteTask.isPending,
    isBulkDeleting: bulkDelete.isPending,
    // Handlers
    openCreate,
    openEdit,
    closeForm,
    requestDelete,
    cancelDelete,
    confirmDelete,
    toggleComplete,
    changeStatus,
    bulkCompleteSelected,
    bulkDeleteSelected,
  } as const
}
