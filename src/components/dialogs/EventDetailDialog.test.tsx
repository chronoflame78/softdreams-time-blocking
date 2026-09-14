import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EventDetailDialog } from './EventDetailDialog'

const event = {
  id: '1',
  title: 'Task A1',
  description: 'Review PRs',
  start: new Date(2026, 8, 17, 5, 0),
  end: new Date(2026, 8, 17, 6, 15),
}

describe('EventDetailDialog', () => {
  it('shows title, description and formatted time', () => {
    render(<EventDetailDialog event={event} onEdit={() => {}} onDelete={() => {}} onClose={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Task A1' })).toBeInTheDocument()
    expect(screen.getByText('Review PRs')).toBeInTheDocument()
    expect(screen.getByText('Thursday, 17 September 2026 · 05:00 – 06:15')).toBeInTheDocument()
  })

  it('shows a placeholder when there is no description', () => {
    render(
      <EventDetailDialog event={{ ...event, description: '' }} onEdit={() => {}} onDelete={() => {}} onClose={() => {}} />,
    )
    expect(screen.getByText('No description')).toBeInTheDocument()
  })

  it('formats multi-day events with both dates', () => {
    const multi = { ...event, end: new Date(2026, 8, 18, 1, 0) }
    render(<EventDetailDialog event={multi} onEdit={() => {}} onDelete={() => {}} onClose={() => {}} />)
    expect(screen.getByText('Thursday, 17 September 2026 05:00 → Friday, 18 September 2026 01:00')).toBeInTheDocument()
  })

  it('wires the action buttons', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const onClose = vi.fn()
    render(<EventDetailDialog event={event} onEdit={onEdit} onDelete={onDelete} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
