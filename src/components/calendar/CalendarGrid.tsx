import { useEffect, useRef, type MouseEvent, type PointerEvent, type RefObject } from 'react'
import type { CalendarEvent, TimeRange } from '../../types/event'
import { HOUR_HEIGHT, minutesToPx, nowOffsetMinutes } from '../../utils/layout'
import { DayColumn } from './DayColumn'
import { HourLines } from './HourLines'
import { TimeGutter } from './TimeGutter'

interface CalendarGridProps {
  days: Date[]
  events: CalendarEvent[]
  now: Date
  /** Ref to the element wrapping the day columns — used by the drag hooks for hit-testing. */
  gridRef: RefObject<HTMLDivElement | null>
  selection: TimeRange | null
  draggingId: string | null
  onGridPointerDown: (e: PointerEvent<HTMLElement>) => void
  onEventPointerDown: (e: PointerEvent<HTMLElement>, event: CalendarEvent) => void
  onEventContextMenu: (e: MouseEvent<HTMLElement>, event: CalendarEvent) => void
}

/** Scrollable body: time gutter on the left, seven day columns on the right. */
export function CalendarGrid({
  days,
  events,
  now,
  gridRef,
  selection,
  draggingId,
  onGridPointerDown,
  onEventPointerDown,
  onEventContextMenu,
}: CalendarGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Start with the current time about a quarter of the way down the viewport.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const target = minutesToPx(nowOffsetMinutes(new Date())) - el.clientHeight / 4
    el.scrollTop = Math.max(0, Math.min(target, el.scrollHeight - el.clientHeight))
  }, [])

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-scroll [scrollbar-gutter:stable]" data-testid="calendar-scroll">
      <div className="flex">
        <TimeGutter />
        <div
          ref={gridRef}
          className={`relative flex flex-1 select-none ${draggingId ? 'cursor-grabbing' : 'cursor-default'}`}
          style={{ minHeight: HOUR_HEIGHT * 24 }}
          onPointerDown={onGridPointerDown}
          data-testid="calendar-grid"
        >
          <HourLines />
          {days.map((day) => (
            <DayColumn
              key={day.toISOString()}
              day={day}
              events={events}
              now={now}
              selection={selection}
              draggingId={draggingId}
              onEventPointerDown={onEventPointerDown}
              onEventContextMenu={onEventContextMenu}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
