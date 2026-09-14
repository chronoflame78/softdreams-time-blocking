import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import type { TimeRange } from '../types/event'
import { MINUTES_PER_DAY, dateFromDayAndMinutes, floorToSlot, snapToSlot } from '../utils/date'
import { SLOT_MINUTES, pointToSlot } from '../utils/layout'

interface Options {
  /** Element wrapping the 7 day columns (used to translate pointer → slot). */
  gridRef: RefObject<HTMLElement | null>
  days: Date[]
  /** Called with the selected range when the pointer is released. */
  onSelect: (range: TimeRange) => void
}

interface DragState {
  dayIndex: number
  anchorMinutes: number
  moved: boolean
}

/** Default length of the event created by a plain click (no drag). */
const CLICK_EVENT_MINUTES = 60

/**
 * Press-and-drag on empty grid space to select a time range.
 * Returns the live selection (for rendering a ghost block) and the pointerdown handler.
 */
export function useDragToCreate({ gridRef, days, onSelect }: Options) {
  const [selection, setSelection] = useState<TimeRange | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const selectionRef = useRef<TimeRange | null>(null)
  const onSelectRef = useRef(onSelect)
  useLayoutEffect(() => {
    onSelectRef.current = onSelect
  })

  const update = useCallback((range: TimeRange | null) => {
    selectionRef.current = range
    setSelection(range)
  }, [])

  const rangeFor = useCallback(
    (dayIndex: number, anchor: number, current: number): TimeRange => {
      const day = days[dayIndex]
      // Dragging down extends the end; dragging up extends the start (anchor slot stays included).
      const startMin = current < anchor ? Math.min(current, anchor) : anchor
      const endMin = current < anchor ? anchor + SLOT_MINUTES : Math.max(current, anchor + SLOT_MINUTES)
      return {
        start: dateFromDayAndMinutes(day, Math.max(0, startMin)),
        end: dateFromDayAndMinutes(day, Math.min(MINUTES_PER_DAY, endMin)),
      }
    },
    [days],
  )

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const grid = gridRef.current
      if (e.button !== 0 || !grid) return
      // Events handle their own pointer interactions.
      if ((e.target as HTMLElement).closest('[data-event-id]')) return

      const slot = pointToSlot(grid.getBoundingClientRect(), e.clientX, e.clientY, days.length)
      const anchorMinutes = floorToSlot(slot.minutes, SLOT_MINUTES)
      dragRef.current = { dayIndex: slot.dayIndex, anchorMinutes, moved: false }
      update(rangeFor(slot.dayIndex, anchorMinutes, anchorMinutes))
      e.preventDefault()
    },
    [gridRef, days.length, rangeFor, update],
  )

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const drag = dragRef.current
      const grid = gridRef.current
      if (!drag || !grid) return
      const slot = pointToSlot(grid.getBoundingClientRect(), e.clientX, e.clientY, days.length)
      const current = snapToSlot(slot.minutes, SLOT_MINUTES)
      if (current !== drag.anchorMinutes) drag.moved = true
      update(rangeFor(drag.dayIndex, drag.anchorMinutes, current))
    }

    const handleUp = () => {
      const drag = dragRef.current
      if (!drag) return
      const range = drag.moved
        ? selectionRef.current
        : rangeFor(drag.dayIndex, drag.anchorMinutes, drag.anchorMinutes + CLICK_EVENT_MINUTES)
      dragRef.current = null
      update(null)
      if (range) onSelectRef.current(range)
    }

    const handleCancel = () => {
      dragRef.current = null
      update(null)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointercancel', handleCancel)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointercancel', handleCancel)
    }
  }, [gridRef, days.length, rangeFor, update])

  return { selection, onPointerDown }
}
