import type { CSSProperties, MouseEvent, PointerEvent } from 'react'
import type { CalendarEvent } from '../../types/event'
import { formatTime, formatTimeRange } from '../../utils/date'
import type { PositionedEvent } from '../../utils/layout'

interface EventBlockProps {
  positioned: PositionedEvent
  /** True while this event is being dragged. */
  dragging?: boolean
  onPointerDown: (e: PointerEvent<HTMLElement>, event: CalendarEvent) => void
  onContextMenu: (e: MouseEvent<HTMLElement>, event: CalendarEvent) => void
}

/** Right-hand gap so blocks never touch the next column line (like Google Calendar). */
const COLUMN_GAP_PX = 8
/** Blocks shorter than this render title and time on one line. */
const COMPACT_HEIGHT_PX = 36

function eventBlockStyle({ top, height, column, columns }: PositionedEvent): CSSProperties {
  const width = 100 / columns
  const isLast = column === columns - 1
  return {
    top,
    height,
    left: `${column * width}%`,
    width: `calc(${width}% - ${isLast ? COLUMN_GAP_PX : 2}px)`,
  }
}

export function EventBlock({ positioned, dragging, onPointerDown, onContextMenu }: EventBlockProps) {
  const { event, height } = positioned
  const compact = height < COMPACT_HEIGHT_PX

  return (
    <div
      role="button"
      tabIndex={0}
      data-event-id={event.id}
      aria-label={`${event.title}, ${formatTimeRange(event.start, event.end)}`}
      style={eventBlockStyle(positioned)}
      onPointerDown={(e) => onPointerDown(e, event)}
      onContextMenu={(e) => onContextMenu(e, event)}
      className={`absolute z-10 select-none overflow-hidden rounded bg-[#e4c441] px-2 py-1 text-xs leading-4 text-white ${
        dragging ? 'cursor-grabbing shadow-[0_6px_16px_rgba(0,0,0,0.3)] ring-2 ring-white/70' : 'cursor-pointer hover:brightness-95'
      }`}
    >
      {compact ? (
        <p className="truncate">
          <span className="font-medium">{event.title}</span>
          <span>, {formatTime(event.start)}</span>
        </p>
      ) : (
        <>
          <p className="truncate font-medium">{event.title}</p>
          <p className="truncate">{formatTimeRange(event.start, event.end)}</p>
        </>
      )}
    </div>
  )
}
