import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HOUR_HEIGHT, layoutDayEvents } from '../../utils/layout'
import { EventBlock } from './EventBlock'

const day = new Date(2026, 8, 17)
const event = {
  id: 'e1',
  title: 'Task A1',
  description: '',
  start: new Date(2026, 8, 17, 5, 0),
  end: new Date(2026, 8, 17, 6, 15),
}

describe('EventBlock', () => {
  it('renders title and time range at the right position', () => {
    const [positioned] = layoutDayEvents([event], day)
    render(<EventBlock positioned={positioned} onPointerDown={() => {}} onContextMenu={() => {}} />)
    const block = screen.getByRole('button', { name: 'Task A1, 05:00 – 06:15' })
    expect(block).toHaveTextContent('Task A1')
    expect(block).toHaveTextContent('05:00 – 06:15')
    expect(block).toHaveStyle({ top: `${5 * HOUR_HEIGHT}px`, height: `${1.25 * HOUR_HEIGHT}px` })
    expect(block).toHaveAttribute('data-event-id', 'e1')
  })

  it('uses a compact single-line layout for short events', () => {
    const short = { ...event, end: new Date(2026, 8, 17, 5, 15) }
    const [positioned] = layoutDayEvents([short], day)
    render(<EventBlock positioned={positioned} onPointerDown={() => {}} onContextMenu={() => {}} />)
    expect(screen.getByRole('button')).toHaveTextContent('Task A1, 05:00')
    expect(screen.queryByText('05:00 – 05:15')).toBeNull()
  })

  it('splits width for overlapping events', () => {
    const other = { ...event, id: 'e2', start: new Date(2026, 8, 17, 5, 30), end: new Date(2026, 8, 17, 6, 30) }
    const positioned = layoutDayEvents([event, other], day)
    render(
      <>
        {positioned.map((p) => (
          <EventBlock key={p.event.id} positioned={p} onPointerDown={() => {}} onContextMenu={() => {}} />
        ))}
      </>,
    )
    const blocks = screen.getAllByRole('button')
    expect(blocks[0]).toHaveStyle({ left: '0%' })
    expect(blocks[1]).toHaveStyle({ left: '50%' })
  })

  it('forwards pointerdown and contextmenu with the event', () => {
    const onPointerDown = vi.fn()
    const onContextMenu = vi.fn()
    const [positioned] = layoutDayEvents([event], day)
    render(<EventBlock positioned={positioned} onPointerDown={onPointerDown} onContextMenu={onContextMenu} />)
    fireEvent.pointerDown(screen.getByRole('button'))
    fireEvent.contextMenu(screen.getByRole('button'))
    expect(onPointerDown.mock.calls[0][1]).toBe(event)
    expect(onContextMenu.mock.calls[0][1]).toBe(event)
  })
})
