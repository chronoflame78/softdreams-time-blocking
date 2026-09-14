import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HOUR_HEIGHT } from '../../utils/layout'
import { Calendar } from './Calendar'

/** "Today" for every test: Thursday 17 September 2026, 08:40. */
const TODAY = new Date(2026, 8, 17, 8, 40)
const COLUMN_WIDTH = 100

/** Pointer coordinates for a (dayIndex, hour) slot, given the mocked grid rect. */
function at(dayIndex: number, hour: number, minute = 0) {
  return { clientX: dayIndex * COLUMN_WIDTH + COLUMN_WIDTH / 2, clientY: (hour + minute / 60) * HOUR_HEIGHT }
}

function setup() {
  const utils = render(<Calendar />)
  const grid = screen.getByTestId('calendar-grid')
  grid.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 7 * COLUMN_WIDTH, height: 24 * HOUR_HEIGHT, right: 700, bottom: 1440, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect
  return { ...utils, grid }
}

const dayColumns = () => screen.getAllByTestId('day-column')
const eventBlock = (name: string | RegExp) => screen.getByRole('button', { name })

describe('Calendar', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(TODAY)
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders 7 days starting from today with seeded events', () => {
    setup()
    const headers = screen.getAllByTestId('day-header')
    expect(headers.map((h) => h.textContent)).toEqual(['THU17', 'FRI18', 'SAT19', 'SUN20', 'MON21', 'TUE22', 'WED23'])
    expect(headers[0]).toHaveAttribute('data-today', 'true')
    expect(eventBlock('Task A1, 05:00 – 06:15')).toBeInTheDocument()
    expect(eventBlock('Task A2, 02:15 – 03:15')).toBeInTheDocument()
    expect(eventBlock('Task A3, 06:00 – 07:15')).toBeInTheDocument()
  })

  it('shows the current-time line only in today’s column at the right offset', () => {
    setup()
    const lines = screen.getAllByTestId('current-time-line')
    expect(lines).toHaveLength(1)
    expect(dayColumns()[0]).toContainElement(lines[0])
    expect(lines[0]).toHaveStyle({ top: `${(8 + 40 / 60) * HOUR_HEIGHT}px` })
  })

  describe('drag on empty space → create (Req. 3)', () => {
    it('opens the create dialog pre-filled with the dragged, snapped range', () => {
      const { grid } = setup()
      fireEvent.pointerDown(grid, { button: 0, ...at(1, 9, 5) }) // Fri 09:05 → snaps to 09:00
      expect(screen.getByTestId('selection-block')).toBeInTheDocument()
      fireEvent.pointerMove(window, at(1, 10, 20)) // → 10:15
      fireEvent.pointerUp(window)

      const dialog = screen.getByRole('dialog', { name: 'New event' })
      expect(within(dialog).getByLabelText('Start')).toHaveValue('2026-09-18T09:00')
      expect(within(dialog).getByLabelText('End')).toHaveValue('2026-09-18T10:15')
      expect(screen.queryByTestId('selection-block')).toBeNull()
    })

    it('handles dragging upward (start < end)', () => {
      const { grid } = setup()
      fireEvent.pointerDown(grid, { button: 0, ...at(2, 10) })
      fireEvent.pointerMove(window, at(2, 9))
      fireEvent.pointerUp(window)

      const dialog = screen.getByRole('dialog', { name: 'New event' })
      expect(within(dialog).getByLabelText('Start')).toHaveValue('2026-09-19T09:00')
      expect(within(dialog).getByLabelText('End')).toHaveValue('2026-09-19T10:15')
    })

    it('a plain click selects a one-hour slot', () => {
      const { grid } = setup()
      fireEvent.pointerDown(grid, { button: 0, ...at(0, 14) })
      fireEvent.pointerUp(window)
      const dialog = screen.getByRole('dialog', { name: 'New event' })
      expect(within(dialog).getByLabelText('Start')).toHaveValue('2026-09-17T14:00')
      expect(within(dialog).getByLabelText('End')).toHaveValue('2026-09-17T15:00')
    })

    it('saving the dialog adds the event to the grid', () => {
      const { grid } = setup()
      fireEvent.pointerDown(grid, { button: 0, ...at(1, 9) })
      fireEvent.pointerMove(window, at(1, 10))
      fireEvent.pointerUp(window)

      const dialog = screen.getByRole('dialog', { name: 'New event' })
      fireEvent.change(within(dialog).getByLabelText('Title'), { target: { value: 'Deep work' } })
      fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }))

      expect(screen.queryByRole('dialog')).toBeNull()
      const block = eventBlock('Deep work, 09:00 – 10:00')
      expect(dayColumns()[1]).toContainElement(block)
    })

    it('cancelling discards the selection', () => {
      const { grid } = setup()
      fireEvent.pointerDown(grid, { button: 0, ...at(1, 9) })
      fireEvent.pointerUp(window)
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(screen.queryByRole('dialog')).toBeNull()
      expect(screen.getAllByRole('button', { name: /Task A/ })).toHaveLength(3)
    })

    it('ignores right-button presses', () => {
      const { grid } = setup()
      fireEvent.pointerDown(grid, { button: 2, ...at(1, 9) })
      fireEvent.pointerUp(window)
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  describe('drag an event → move (Req. 4)', () => {
    it('moves an event to another day and time, preserving duration', () => {
      setup()
      const block = eventBlock('Task A1, 05:00 – 06:15') // Sat 19 (day index 2)
      fireEvent.pointerDown(block, { button: 0, ...at(2, 5, 20) }) // grab 20 min below the top
      fireEvent.pointerMove(window, at(3, 10, 20)) // Sun 20, pointer at 10:20 → start 10:00
      fireEvent.pointerUp(window)

      const moved = eventBlock('Task A1, 10:00 – 11:15')
      expect(dayColumns()[3]).toContainElement(moved)
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('snaps the new start to 15-minute slots', () => {
      setup()
      const block = eventBlock('Task A1, 05:00 – 06:15')
      fireEvent.pointerDown(block, { button: 0, ...at(2, 5)})
      fireEvent.pointerMove(window, at(2, 7, 7)) // 07:07 → 07:00
      fireEvent.pointerUp(window)
      expect(eventBlock('Task A1, 07:00 – 08:15')).toBeInTheDocument()
    })

    it('shows the event at the tentative position while dragging', () => {
      setup()
      const block = eventBlock('Task A1, 05:00 – 06:15')
      fireEvent.pointerDown(block, { button: 0, ...at(2, 5) })
      fireEvent.pointerMove(window, at(4, 12))
      expect(eventBlock('Task A1, 12:00 – 13:15')).toBeInTheDocument()
      expect(dayColumns()[4]).toContainElement(eventBlock('Task A1, 12:00 – 13:15'))
      fireEvent.pointerUp(window)
    })

    it('persists the move across remounts', () => {
      const { unmount } = setup()
      fireEvent.pointerDown(eventBlock('Task A1, 05:00 – 06:15'), { button: 0, ...at(2, 5) })
      fireEvent.pointerMove(window, at(2, 8))
      fireEvent.pointerUp(window)
      unmount()
      setup()
      expect(eventBlock('Task A1, 08:00 – 09:15')).toBeInTheDocument()
    })
  })

  describe('left-click an event → details (Req. 5)', () => {
    it('opens the detail dialog on click', () => {
      setup()
      const block = eventBlock('Task A1, 05:00 – 06:15')
      fireEvent.pointerDown(block, { button: 0, ...at(2, 5, 30) })
      fireEvent.pointerUp(window)

      const dialog = screen.getByRole('dialog', { name: 'Event: Task A1' })
      expect(within(dialog).getByText('Review pull requests and plan the sprint.')).toBeInTheDocument()
      expect(within(dialog).getByText('Saturday, 19 September 2026 · 05:00 – 06:15')).toBeInTheDocument()
    })

    it('treats a tiny pointer movement as a click, not a drag', () => {
      setup()
      const block = eventBlock('Task A1, 05:00 – 06:15')
      const start = at(2, 5, 30)
      fireEvent.pointerDown(block, { button: 0, ...start })
      fireEvent.pointerMove(window, { clientX: start.clientX + 2, clientY: start.clientY + 2 })
      fireEvent.pointerUp(window)

      expect(screen.getByRole('dialog', { name: 'Event: Task A1' })).toBeInTheDocument()
      expect(eventBlock('Task A1, 05:00 – 06:15')).toBeInTheDocument()
    })

    it('does not open the create dialog when pressing on an event', () => {
      setup()
      fireEvent.pointerDown(eventBlock('Task A1, 05:00 – 06:15'), { button: 0, ...at(2, 5, 30) })
      fireEvent.pointerUp(window)
      expect(screen.queryByRole('dialog', { name: 'New event' })).toBeNull()
    })
  })

  describe('right-click an event → context menu (Req. 6)', () => {
    it('opens a menu with Edit and Delete', () => {
      setup()
      fireEvent.contextMenu(eventBlock('Task A1, 05:00 – 06:15'), { clientX: 250, clientY: 320 })
      const menu = screen.getByRole('menu')
      expect(within(menu).getAllByRole('menuitem').map((i) => i.textContent)).toEqual(['Edit', 'Delete'])
    })

    it('Edit opens the edit dialog and saving updates the event', () => {
      setup()
      fireEvent.contextMenu(eventBlock('Task A1, 05:00 – 06:15'))
      fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }))

      const dialog = screen.getByRole('dialog', { name: 'Edit event' })
      expect(within(dialog).getByLabelText('Title')).toHaveValue('Task A1')
      fireEvent.change(within(dialog).getByLabelText('Title'), { target: { value: 'Task A1 (renamed)' } })
      fireEvent.change(within(dialog).getByLabelText('End'), { target: { value: '2026-09-19T07:00' } })
      fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }))

      expect(screen.queryByRole('dialog')).toBeNull()
      expect(screen.queryByRole('menu')).toBeNull()
      expect(eventBlock('Task A1 (renamed), 05:00 – 07:00')).toBeInTheDocument()
    })

    it('Delete removes the event', () => {
      setup()
      fireEvent.contextMenu(eventBlock('Task A2, 02:15 – 03:15'))
      fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }))
      expect(screen.queryByRole('button', { name: 'Task A2, 02:15 – 03:15' })).toBeNull()
      expect(screen.getAllByRole('button', { name: /Task A/ })).toHaveLength(2)
      expect(screen.queryByRole('menu')).toBeNull()
    })

    it('closes the menu on Escape without changes', () => {
      setup()
      fireEvent.contextMenu(eventBlock('Task A1, 05:00 – 06:15'))
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(screen.queryByRole('menu')).toBeNull()
      expect(eventBlock('Task A1, 05:00 – 06:15')).toBeInTheDocument()
    })
  })

  describe('detail dialog actions', () => {
    it('Edit from the detail dialog switches to the edit form', () => {
      setup()
      fireEvent.pointerDown(eventBlock('Task A1, 05:00 – 06:15'), { button: 0, ...at(2, 5, 30) })
      fireEvent.pointerUp(window)
      fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
      expect(screen.getByRole('dialog', { name: 'Edit event' })).toBeInTheDocument()
    })

    it('Delete from the detail dialog removes the event', () => {
      setup()
      fireEvent.pointerDown(eventBlock('Task A3, 06:00 – 07:15'), { button: 0, ...at(4, 6, 30) })
      fireEvent.pointerUp(window)
      fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
      expect(screen.queryByRole('dialog')).toBeNull()
      expect(screen.queryByRole('button', { name: 'Task A3, 06:00 – 07:15' })).toBeNull()
    })
  })
})
