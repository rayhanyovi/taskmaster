import { LogOut, UserCircle } from 'lucide-react'
import { AppFooter } from '../../../components/layout/AppFooter'
import { Button } from '../../../components/ui/Button'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ErrorAlert } from '../../../components/ui/ErrorAlert'
import { LoginForm } from '../../auth/components/LoginForm'
import { useAuth } from '../../auth/hooks/useAuth'
import { useTaskWorkspace } from '../hooks/useTaskWorkspace'
import { BulkActionBar } from '../components/BulkActionBar'
import { TaskCommandDeck } from '../components/TaskCommandDeck'
import { TaskFormModal } from '../components/TaskFormModal'
import { TaskList } from '../components/TaskList'
import { TaskLoadingSkeleton } from '../components/TaskLoadingSkeleton'
import { TaskScenarioLab } from '../components/TaskScenarioLab'
import { TaskToolbar } from '../components/TaskToolbar'

// ── Page entry point ─────────────────────────────────────────────────────────
// Renders the login screen when unauthenticated; the full workspace otherwise.
// Intentionally kept as a single route — no separate /login path — because the
// session is ephemeral and the workspace is the whole app.
export function DashboardPage() {
  const { session } = useAuth()
  return session ? <TaskWorkspace /> : <LoginScreen />
}

// ── Login screen ──────────────────────────────────────────────────────────────
function LoginScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200/70 bg-white/96 p-6 shadow-[0_24px_70px_-28px_rgba(15,23,42,0.28)] backdrop-blur-sm sm:p-8">
        <LoginForm />
      </div>
    </main>
  )
}

// ── Workspace ─────────────────────────────────────────────────────────────────
// Pure render layer — all state and handlers come from useTaskWorkspace.
function TaskWorkspace() {
  const {
    tasks,
    filteredTasks,
    visibleIds,
    isLoading,
    showTaskError,
    errorMessage,
    isWorking,
    refetch,
    session,
    avatarInitial,
    sessionDateLabel,
    logout,
    viewMode,
    selectedIds,
    isFormOpen,
    editingTask,
    taskPendingDelete,
    bulkDeleteConfirmOpen,
    setBulkDeleteConfirmOpen,
    toggleSelection,
    selectVisible,
    deselectAll,
    isDeleting,
    isBulkDeleting,
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
  } = useTaskWorkspace()

  return (
    <div className="min-h-screen">

      {/* ── Header ── */}
      <header className="border-b border-white/40 bg-white/70 backdrop-blur-md">
        <div className="relative flex min-h-20 items-center justify-center px-4 py-4 sm:px-6">
          <h1 className="text-lg font-bold tracking-[0.28em] text-slate-950">TASKMASTER</h1>

          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-2 sm:right-6 sm:gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-2 py-2 shadow-sm lg:px-4 lg:py-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
                {avatarInitial}
              </div>
              <div className="hidden text-right lg:block">
                <div className="flex items-center justify-end gap-1.5 text-sm font-semibold text-slate-800">
                  <UserCircle className="h-4 w-4 text-slate-400" />
                  {session?.email}
                </div>
                <div className="text-xs text-slate-500">
                  {sessionDateLabel ? `Session restored from ${sessionDateLabel}` : 'Single-user demo'}
                </div>
              </div>
            </div>
            <Button variant="secondary" className="gap-2 px-3 sm:px-4" onClick={() => void logout()}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="mx-auto max-w-4xl px-4 py-6 pb-0 sm:px-6">
        <div className="space-y-5">
          <TaskCommandDeck />

          <TaskScenarioLab onRefetch={() => void refetch()} />

          <TaskToolbar
            tasks={tasks}
            visibleCount={filteredTasks.length}
            onCreate={openCreate}
          />

          <BulkActionBar
            visibleIds={visibleIds}
            selectedIds={selectedIds}
            onSelectVisible={selectVisible}
            onCompleteSelected={() => void bulkCompleteSelected()}
            onDeleteSelected={() => setBulkDeleteConfirmOpen(true)}
            onClear={deselectAll}
            isWorking={isWorking}
          />

          {isLoading ? <TaskLoadingSkeleton /> : null}

          {showTaskError ? (
            <ErrorAlert message={errorMessage} onRetry={() => void refetch()} />
          ) : null}

          {!isLoading && !showTaskError && tasks.length === 0 ? (
            <EmptyState
              title="No tasks yet"
              description="Create your first task to populate the board."
              actionLabel="Create Task"
              onAction={openCreate}
            />
          ) : null}

          {!isLoading && !showTaskError && tasks.length > 0 && filteredTasks.length === 0 ? (
            <EmptyState
              title="No matching tasks"
              description="Try adjusting the search term, clear the active filter, or create a fresh task."
              actionLabel="Create Task"
              onAction={openCreate}
            />
          ) : null}

          {!isLoading && !showTaskError && filteredTasks.length > 0 ? (
            <TaskList
              tasks={filteredTasks}
              selectedIds={selectedIds}
              viewMode={viewMode}
              onToggleSelect={toggleSelection}
              onToggleComplete={toggleComplete}
              onStatusChange={changeStatus}
              onOpenDetails={openEdit}
              onEdit={openEdit}
              onDelete={requestDelete}
            />
          ) : null}
        </div>
      </main>

      <AppFooter />

      {/* ── Modals ── */}
      <TaskFormModal open={isFormOpen} task={editingTask} onClose={closeForm} />

      <ConfirmDialog
        open={Boolean(taskPendingDelete)}
        title="Delete task?"
        description={
          taskPendingDelete
            ? `This will permanently delete "${taskPendingDelete.title}".`
            : 'This task will be deleted.'
        }
        isConfirming={isDeleting}
        onOpenChange={(open) => { if (!open) cancelDelete() }}
        onConfirm={() => void confirmDelete()}
      />

      <ConfirmDialog
        open={bulkDeleteConfirmOpen}
        title="Delete selected tasks?"
        description={`This will permanently delete ${selectedIds.length} selected ${
          selectedIds.length === 1 ? 'task' : 'tasks'
        }.`}
        confirmLabel="Delete selected"
        isConfirming={isBulkDeleting}
        onOpenChange={setBulkDeleteConfirmOpen}
        onConfirm={() => void bulkDeleteSelected()}
      />
    </div>
  )
}
