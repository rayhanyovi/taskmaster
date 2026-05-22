import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskFilterTabs } from './TaskFilterTabs'
import { useTaskFilterStore } from '../store/taskFilterStore'
import type { Task } from '../../../types/task'

const makeTasks = (): Task[] => [
  { id: '1', title: 'Todo task', description: '', status: 'todo', completed: false, createdAt: '', updatedAt: '' },
  { id: '2', title: 'In progress task', description: '', status: 'in_progress', completed: false, createdAt: '', updatedAt: '' },
  { id: '3', title: 'Done task', description: '', status: 'completed', completed: true, createdAt: '', updatedAt: '' },
]

beforeEach(() => {
  useTaskFilterStore.setState({ searchKeyword: '', filterStatus: 'all', viewMode: 'kanban' })
})

describe('TaskFilterTabs', () => {
  it('renders All, Pending, and Completed tabs', () => {
    render(<TaskFilterTabs tasks={[]} />)
    expect(screen.getByText(/^All/)).toBeInTheDocument()
    expect(screen.getByText(/^Pending/)).toBeInTheDocument()
    expect(screen.getByText(/^Completed/)).toBeInTheDocument()
  })

  it('shows correct counts for each filter', () => {
    const tasks = makeTasks()
    render(<TaskFilterTabs tasks={tasks} />)
    // All: 3 tasks
    expect(screen.getByText(/All \(3\)/)).toBeInTheDocument()
    // Pending: todo + in_progress = 2
    expect(screen.getByText(/Pending \(2\)/)).toBeInTheDocument()
    // Completed: 1
    expect(screen.getByText(/Completed \(1\)/)).toBeInTheDocument()
  })

  it('shows count of 0 when no tasks', () => {
    render(<TaskFilterTabs tasks={[]} />)
    expect(screen.getByText('All (0)')).toBeInTheDocument()
    expect(screen.getByText('Pending (0)')).toBeInTheDocument()
    expect(screen.getByText('Completed (0)')).toBeInTheDocument()
  })

  it('clicking Pending updates the store to pending', async () => {
    const user = userEvent.setup()
    render(<TaskFilterTabs tasks={makeTasks()} />)
    await user.click(screen.getByText(/^Pending/))
    expect(useTaskFilterStore.getState().filterStatus).toBe('pending')
  })

  it('clicking Completed updates the store to completed', async () => {
    const user = userEvent.setup()
    render(<TaskFilterTabs tasks={makeTasks()} />)
    await user.click(screen.getByText(/^Completed/))
    expect(useTaskFilterStore.getState().filterStatus).toBe('completed')
  })

  it('clicking All resets the store filter', async () => {
    useTaskFilterStore.getState().setFilterStatus('completed')
    const user = userEvent.setup()
    render(<TaskFilterTabs tasks={makeTasks()} />)
    await user.click(screen.getByText(/^All/))
    expect(useTaskFilterStore.getState().filterStatus).toBe('all')
  })
})
