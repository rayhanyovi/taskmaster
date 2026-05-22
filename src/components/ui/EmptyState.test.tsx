import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders the title and description', () => {
    render(<EmptyState title="Nothing here" description="Create something to start." />)
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
    expect(screen.getByText('Create something to start.')).toBeInTheDocument()
  })

  it('does not render an action button when actionLabel is not provided', () => {
    render(<EmptyState title="Empty" description="Nothing." />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('renders an action button when actionLabel is provided', () => {
    render(<EmptyState title="Empty" description="Nothing." actionLabel="Add item" onAction={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Add item' })).toBeInTheDocument()
  })

  it('calls onAction when the action button is clicked', async () => {
    const onAction = vi.fn()
    const user = userEvent.setup()
    render(<EmptyState title="Empty" description="Nothing." actionLabel="Add item" onAction={onAction} />)
    await user.click(screen.getByRole('button', { name: 'Add item' }))
    expect(onAction).toHaveBeenCalledOnce()
  })
})
