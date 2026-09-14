import type { CalendarEvent } from '../types/event'
import { MINUTES_PER_DAY, addDays, clamp, diffMinutes, minutesFromDayStart, startOfDay } from './date'

/** Pixel height of one hour row in the grid. */
export const HOUR_HEIGHT = 60
export const GRID_HEIGHT = HOUR_HEIGHT * 24
/** Drag/snap resolution in minutes. */
export const SLOT_MINUTES = 15
/** Smallest event a drag-to-create can produce. */
export const MIN_EVENT_MINUTES = 15
/** Pointer must move this far (px) before a press becomes a drag. */
export const DRAG_THRESHOLD_PX = 4

export function minutesToPx(minutes: number): number {
  return (minutes / 60) * HOUR_HEIGHT
}

export function pxToMinutes(px: number): number {
  return (px / HOUR_HEIGHT) * 60
}

/** Whether an event touches the given day (events may span midnight). */
export function eventOverlapsDay(event: CalendarEvent, day: Date): boolean {
  const dayStart = startOfDay(day)
  const dayEnd = addDays(dayStart, 1)
  return event.start < dayEnd && event.end > dayStart
}

export function eventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events.filter((e) => eventOverlapsDay(e, day))
}

export interface EventGeometry {
  /** px from the top of the day column */
  top: number
  /** px */
  height: number
  /** minute offsets within the day, clipped to [0, 1440] */
  startMinutes: number
  endMinutes: number
}

/** Vertical placement of an event inside one day column, clipped to that day. */
export function getEventGeometry(event: CalendarEvent, day: Date): EventGeometry {
  const dayStart = startOfDay(day)
  const startMinutes = clamp(diffMinutes(dayStart, event.start), 0, MINUTES_PER_DAY)
  const endMinutes = clamp(diffMinutes(dayStart, event.end), 0, MINUTES_PER_DAY)
  const top = minutesToPx(startMinutes)
  const height = Math.max(minutesToPx(endMinutes - startMinutes), minutesToPx(MIN_EVENT_MINUTES))
  return { top, height, startMinutes, endMinutes }
}

export interface PositionedEvent extends EventGeometry {
  event: CalendarEvent
  /** 0-based column inside its overlap cluster */
  column: number
  /** number of columns in the cluster */
  columns: number
}

/**
 * Lay out the events of one day so overlapping ones sit side by side.
 * Events are grouped into clusters of transitively-overlapping events;
 * inside a cluster each event takes the first free column.
 */
export function layoutDayEvents(events: CalendarEvent[], day: Date): PositionedEvent[] {
  const items = eventsForDay(events, day)
    .map((event) => ({ event, ...getEventGeometry(event, day) }))
    .sort((a, b) => a.startMinutes - b.startMinutes || b.endMinutes - a.endMinutes)

  const result: PositionedEvent[] = []
  let cluster: PositionedEvent[] = []
  let columnEnds: number[] = [] // end minute of the last event placed in each column
  let clusterEnd = -1

  const flush = () => {
    for (const p of cluster) p.columns = columnEnds.length
    result.push(...cluster)
    cluster = []
    columnEnds = []
    clusterEnd = -1
  }

  for (const item of items) {
    if (cluster.length > 0 && item.startMinutes >= clusterEnd) flush()

    let column = columnEnds.findIndex((end) => end <= item.startMinutes)
    if (column === -1) {
      column = columnEnds.length
      columnEnds.push(item.endMinutes)
    } else {
      columnEnds[column] = item.endMinutes
    }
    clusterEnd = Math.max(clusterEnd, item.endMinutes)
    cluster.push({ ...item, column, columns: 1 })
  }
  flush()

  return result
}

export interface GridSlot {
  dayIndex: number
  /** unsnapped minutes from 00:00 of that day */
  minutes: number
}

/**
 * Map a pointer position to a (day, minutes) slot, given the bounding rect of the
 * element that contains all day columns.
 */
export function pointToSlot(rect: DOMRect, clientX: number, clientY: number, dayCount: number): GridSlot {
  const columnWidth = rect.width / dayCount
  const dayIndex = clamp(Math.floor((clientX - rect.left) / columnWidth), 0, dayCount - 1)
  const minutes = clamp(pxToMinutes(clientY - rect.top), 0, MINUTES_PER_DAY)
  return { dayIndex, minutes }
}

/** Minutes from 00:00 (with seconds) for the "now" indicator. */
export function nowOffsetMinutes(now: Date): number {
  return minutesFromDayStart(now) + now.getSeconds() / 60
}
