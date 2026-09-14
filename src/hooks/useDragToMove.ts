import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import type { CalendarEvent } from '../types/event'
import { addDays, dateFromDayAndMinutes, minutesFromDayStart, snapToSlot, startOfDay } from '../utils/date'
import { DRAG_THRESHOLD_PX, SLOT_MINUTES, pointToSlot } from '../utils/layout'

interface Options {
  gridRef: RefObject<HTMLElement | null>
  days: Date[]
  /** Fired when an event is dropped on a new time. */
  onMove: (id: string, start: Date, end: Date) => void
  /** Fired when the pointer is released without dragging (a plain click). */
  onClick: (event: CalendarEvent) => void
}

interface DragState {
  event: CalendarEvent
  startX: number
  startY: number
  /** ms between the event start and the point where it was grabbed */
  grabOffsetMs: number
  dragging: boolean
}

/**
 * Press-and-drag an event block to move it (same or another day, duration preserved).
 * A press released within the drag threshold is reported as a click instead.
 */
export function useDragToMove({ gridRef, days, onMove, onClick }: Options) {
  /** The event being dragged, already carrying its tentative new start/end. */
  const [preview, setPreview] = useState<CalendarEvent | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const previewRef = useRef<CalendarEvent | null>(null)
  const callbacks = useRef({ onMove, onClick })
  useLayoutEffect(() => {
    callbacks.current = { onMove, onClick }
  })

  const update = useCallback((next: CalendarEvent | null) => {
    previewRef.current = next
    setPreview(next)
  }, [])

  const pointerDate = useCallback(
    (clientX: number, clientY: number): Date | null => {
      const grid = gridRef.current
      if (!grid) return null
      const slot = pointToSlot(grid.getBoundingClientRect(), clientX, clientY, days.length)
      return dateFromDayAndMinutes(days[slot.dayIndex], slot.minutes)
    },
    [gridRef, days],
  )

  const onEventPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>, event: CalendarEvent) => {
      if (e.button !== 0) return
      const at = pointerDate(e.clientX, e.clientY)
      if (!at) return
      dragRef.current = {
        event,
        startX: e.clientX,
        startY: e.clientY,
        grabOffsetMs: at.getTime() - event.start.getTime(),
        dragging: false,
      }
      e.preventDefault()
      e.stopPropagation()
    },
    [pointerDate],
  )

  useEffect(() => {
    const rangeStart = startOfDay(days[0])
    const rangeEnd = addDays(startOfDay(days[days.length - 1]), 1)

    const handleMove = (e: PointerEvent) => {
      const drag = dragRef.current
      if (!drag) return
      if (!drag.dragging) {
        const dx = e.clientX - drag.startX
        const dy = e.clientY - drag.startY
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return
        drag.dragging = true
      }
      const at = pointerDate(e.clientX, e.clientY)
      if (!at) return

      const duration = drag.event.end.getTime() - drag.event.start.getTime()
      const raw = new Date(at.getTime() - drag.grabOffsetMs)
      let start = dateFromDayAndMinutes(raw, snapToSlot(minutesFromDayStart(raw), SLOT_MINUTES))
      // Keep the event inside the visible 7-day range.
      if (start < rangeStart) start = rangeStart
      const latest = new Date(rangeEnd.getTime() - duration)
      if (start > latest) start = latest

      const end = new Date(start.getTime() + duration)
      const current = previewRef.current
      if (current && current.start.getTime() === start.getTime()) return
      update({ ...drag.event, start, end })
    }

    const handleUp = () => {
      const drag = dragRef.current
      if (!drag) return
      const result = previewRef.current
      dragRef.current = null
      update(null)
      if (!drag.dragging) {
        callbacks.current.onClick(drag.event)
      } else if (result && result.start.getTime() !== drag.event.start.getTime()) {
        callbacks.current.onMove(drag.event.id, result.start, result.end)
      }
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
  }, [days, pointerDate, update])

  return { preview, onEventPointerDown }
}
