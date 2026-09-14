import type { CalendarEvent } from '../types/event'

export const STORAGE_KEY = 'time-blocking:events'

interface StoredEvent {
  id: string
  title: string
  description: string
  start: string
  end: string
}

/** Read persisted events; `null` when nothing (valid) is stored. */
export function loadEvents(): CalendarEvent[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    return (parsed as StoredEvent[])
      .map((e) => ({ ...e, start: new Date(e.start), end: new Date(e.end) }))
      .filter((e) => !Number.isNaN(e.start.getTime()) && !Number.isNaN(e.end.getTime()))
  } catch {
    return null
  }
}

export function saveEvents(events: CalendarEvent[]): void {
  try {
    const data: StoredEvent[] = events.map((e) => ({
      ...e,
      start: e.start.toISOString(),
      end: e.end.toISOString(),
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage unavailable (private mode, quota) — the app keeps working in memory.
  }
}
