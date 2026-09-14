export interface CalendarEvent {
  id: string
  title: string
  description: string
  start: Date
  end: Date
}

/** Event data without an id — used by create/edit forms. */
export type EventDraft = Omit<CalendarEvent, 'id'>

/** A selected time range on the grid (drag-to-create). */
export interface TimeRange {
  start: Date
  end: Date
}
