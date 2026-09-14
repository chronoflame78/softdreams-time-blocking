import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ContextMenu } from './ContextMenu'

function setup(onClose = vi.fn(), onEdit = vi.fn(), onDelete = vi.fn()) {
  render(
    <div>
      <p>outside</p>
      <ContextMenu
        x={120}
        y={80}
        onClose={onClose}
        items={[
          { label: 'Edit', onSelect: onEdit },
          { label: 'Delete', onSelect: onDelete, danger: true },
        ]}
      />
    </div>,
  )
  return { onClose, onEdit, onDelete }
}

describe('ContextMenu', () => {
  it('renders the items at the given coordinates', () => {
    setup()
    const menu = screen.getByRole('menu')
    expect(menu).toHaveStyle({ left: '120px', top: '80px' })
    expect(screen.getAllByRole('menuitem').map((el) => el.textContent)).toEqual(['Edit', 'Delete'])
  })

  it('runs the action and closes when an item is clicked', () => {
    const { onClose, onEdit } = setup()
    fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }))
    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes on outside press', () => {
    const { onClose } = setup()
    fireEvent.pointerDown(screen.getByRole('menuitem', { name: 'Edit' }))
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.pointerDown(screen.getByText('outside'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes on Escape', () => {
    const { onClose } = setup()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
