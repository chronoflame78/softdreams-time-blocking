import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal'

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal open={false} onClose={() => {}} title="Test">
        <p>content</p>
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders an accessible dialog and focuses the first control', () => {
    render(
      <Modal open onClose={() => {}} title="Test dialog">
        <input aria-label="first" />
        <button>ok</button>
      </Modal>,
    )
    expect(screen.getByRole('dialog', { name: 'Test dialog' })).toBeInTheDocument()
    expect(screen.getByLabelText('first')).toHaveFocus()
  })

  it('closes on Escape', () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} title="Test">
        <p>content</p>
      </Modal>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes on backdrop press but not on inner press', () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} title="Test">
        <p>content</p>
      </Modal>,
    )
    fireEvent.pointerDown(screen.getByText('content'))
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.pointerDown(screen.getByTestId('modal-backdrop'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('wraps Tab focus inside the dialog', () => {
    render(
      <Modal open onClose={() => {}} title="Test">
        <button>first</button>
        <button>last</button>
      </Modal>,
    )
    const last = screen.getByText('last')
    last.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(screen.getByText('first')).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(last).toHaveFocus()
  })
})
