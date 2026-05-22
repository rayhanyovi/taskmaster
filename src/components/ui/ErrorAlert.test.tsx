import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorAlert } from './ErrorAlert'

describe('ErrorAlert', () => {
  it('renders the error message', () => {
    render(<ErrorAlert message="Something went wrong." onRetry={vi.fn()} />)
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
  })

  it('renders a "Try Again" button', () => {
    render(<ErrorAlert message="Error" onRetry={vi.fn()} />)
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('does not render a button when onRetry is not provided', () => {
    render(<ErrorAlert message="Error" />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('calls onRetry when the button is clicked', async () => {
    const onRetry = vi.fn()
    const user = userEvent.setup()
    render(<ErrorAlert message="Error" onRetry={onRetry} />)
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
