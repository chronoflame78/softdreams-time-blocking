import { useMemo, type MouseEvent, type PointerEvent } from 'react'
import type { CalendarEvent, TimeRange } from '../../types/event'
import { isSameDay } from '../../utils/date'
import { GRID_HEIGHT, layoutDayEvents } from '../../utils/layout'
import { CurrentTimeLine } from './CurrentTimeLine'
import { EventBlock } from './EventBlock'
import { SelectionBlock } from './SelectionBlock'

interface DayColumnProps {
  day: Date
  events: CalendarEvent[]
  now: Date
  /** Drag-to-create selection; rendered only when it falls on this day. */
  selection: TimeRange | null
  /** Id of the event currently being dragged. */
  draggingId: string | null
  onEventPointerDown: (e: PointerEvent<HTMLElement>, event: CalendarEvent) => void
  onEventContextMenu: (e: MouseEvent<HTMLElement>, event: CalendarEvent) => void
}

export function DayColumn({
  day,
  events,
  now,
  selection,
  draggingId,
  onEventPointerDown,
  onEventContextMenu,
}: DayColumnProps) {
  const positioned = useMemo(() => layoutDayEvents(events, day), [events, day])
  const isToday = isSameDay(day, now)
  const showSelection = selection && isSameDay(selection.start, day)

  return (
    <div
      className="relative flex-1 border-l border-[#dadce0]"
      style={{ height: GRID_HEIGHT }}
      data-testid="day-column"
      data-today={isToday || undefined}
    >
      {positioned.map((p) => (
        <EventBlock
          key={p.event.id}
          positioned={p}
          dragging={p.event.id === draggingId}
          onPointerDown={onEventPointerDown}
          onContextMenu={onEventContextMenu}
        />
      ))}
      {showSelection && <SelectionBlock range={selection} day={day} />}
      {isToday && <CurrentTimeLine now={now} />}
    </div>
  )
}
