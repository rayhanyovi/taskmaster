import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskItem } from './TaskItem'
import type { Task } from '../../../types/task'

const baseTask: Task = {
  id: 'task-1',
  title: 'Write release notes',
  description: 'Cover all the breaking changes.',
  status: 'todo',
  completed: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
}

const defaultProps = {
  task: baseTask,
  isSelected: false,
  isSelectionMode: false,
  onToggleSelect: vi.fn(),
  onToggleComplete: vi.fn(),
  onStatusChange: vi.fn(),
  onOpenDetails: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
}

describe('TaskItem rendering', () => {
  it('renders the task title', () => {
    render(<TaskItem {...defaultProps} />)
    expect(screen.getByText('Write release notes')).toBeInTheDocument()
  })

  it('renders the task description', () => {
    render(<TaskItem {...defaultProps} />)
    expect(screen.getByText('Cover all the breaking changes.')).toBeInTheDocument()
  })

  it('renders the status badge', () => {
    render(<TaskItem {...defaultProps} />)
    expect(screen.getByText('To do')).toBeInTheDocument()
  })

  it('applies strikethrough styling for completed tasks', () => {
    const task: Task = { ...baseTask, status: 'completed', completed: true }
    render(<TaskItem {...defaultProps} task={task} />)
    const title = screen.getByText('Write release notes')
    expect(title.className).toMatch(/line-through/)
  })

  it('shows In progress badge for in_progress tasks', () => {
    const task: Task = { ...baseTask, status: 'in_progress' }
    render(<TaskItem {...defaultProps} task={task} />)
    expect(screen.getByText('In progress')).toBeInTheDocument()
  })

  it('shows Completed badge for completed tasks', () => {
    const task: Task = { ...baseTask, status: 'completed', completed: true }
    render(<TaskItem {...defaultProps} task={task} />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })
})

describe('TaskItem in_progress status control', () => {
  it('calls onToggleComplete when clicking the status button on an in_progress task', async () => {
    const onToggleComplete = vi.fn()
    const task: Task = { ...baseTask, status: 'in_progress' }
    const user = userEvent.setup()
    render(<TaskItem {...defaultProps} task={task} onToggleComplete={onToggleComplete} />)

    const button = screen.getByRole('button', { name: /mark.*complete/i })
    await user.click(button)
    expect(onToggleComplete).toHaveBeenCalledWith(task)
  })

  it('calls onToggleComplete when clicking the status button on a completed task', async () => {
    const onToggleComplete = vi.fn()
    const task: Task = { ...baseTask, status: 'completed', completed: true }
    const user = userEvent.setup()
    render(<TaskItem {...defaultProps} task={task} onToggleComplete={onToggleComplete} />)

    const button = screen.getByRole('button', { name: /mark.*in progress/i })
    await user.click(button)
    expect(onToggleComplete).toHaveBeenCalledWith(task)
  })
})

describe('TaskItem selection mode', () => {
  it('renders a checkbox in selection mode', () => {
    render(<TaskItem {...defaultProps} isSelectionMode={true} />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('checkbox is checked when task is selected', () => {
    render(<TaskItem {...defaultProps} isSelectionMode={true} isSelected={true} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('calls onToggleSelect when checkbox is clicked', async () => {
    const onToggleSelect = vi.fn()
    const user = userEvent.setup()
    render(<TaskItem {...defaultProps} isSelectionMode={true} onToggleSelect={onToggleSelect} />)
    await user.click(screen.getByRole('checkbox'))
    expect(onToggleSelect).toHaveBeenCalledWith('task-1')
  })
})
