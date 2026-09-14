import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EventFormDialog } from './EventFormDialog'

const initial = {
  title: '',
  description: '',
  start: new Date(2026, 8, 17, 9, 0),
  end: new Date(2026, 8, 17, 10, 0),
}

describe('EventFormDialog', () => {
  it('pre-fills start/end in create mode and submits the entered values', () => {
    const onSubmit = vi.fn()
    render(<EventFormDialog mode="create" initial={initial} onSubmit={onSubmit} onClose={() => {}} />)

    expect(screen.getByRole('dialog', { name: 'New event' })).toBeInTheDocument()
    expect(screen.getByLabelText('Start')).toHaveValue('2026-09-17T09:00')
    expect(screen.getByLabelText('End')).toHaveValue('2026-09-17T10:00')

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: '  Planning  ' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Q4 goals' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const draft = onSubmit.mock.calls[0][0]
    expect(draft.title).toBe('Planning')
    expect(draft.description).toBe('Q4 goals')
    expect(draft.start.getTime()).toBe(initial.start.getTime())
    expect(draft.end.getTime()).toBe(initial.end.getTime())
  })

  it('pre-fills an existing event in edit mode', () => {
    const onSubmit = vi.fn()
    render(
      <EventFormDialog
        mode="edit"
        initial={{ ...initial, title: 'Old', description: 'desc' }}
        onSubmit={onSubmit}
        onClose={() => {}}
      />,
    )
    expect(screen.getByRole('dialog', { name: 'Edit event' })).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveValue('Old')
    expect(screen.getByLabelText('Description')).toHaveValue('desc')

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New' } })
    fireEvent.change(screen.getByLabelText('End'), { target: { value: '2026-09-17T11:30' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit.mock.calls[0][0]).toMatchObject({ title: 'New', end: new Date(2026, 8, 17, 11, 30) })
  })

  it('shows validation errors and does not submit', () => {
    const onSubmit = vi.fn()
    render(<EventFormDialog mode="create" initial={initial} onSubmit={onSubmit} onClose={() => {}} />)

    fireEvent.change(screen.getByLabelText('End'), { target: { value: '2026-09-17T08:00' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Title is required.')).toBeInTheDocument()
    expect(screen.getByText('End time must be after start time.')).toBeInTheDocument()
  })

  it('clears a field error once the field changes', () => {
    render(<EventFormDialog mode="create" initial={initial} onSubmit={() => {}} onClose={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText('Title is required.')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'x' } })
    expect(screen.queryByText('Title is required.')).toBeNull()
  })

  it('calls onClose from Cancel', () => {
    const onClose = vi.fn()
    render(<EventFormDialog mode="create" initial={initial} onSubmit={() => {}} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
