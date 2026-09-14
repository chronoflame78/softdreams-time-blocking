import type { CalendarEvent } from '../types/event'
import { addDays, dateFromDayAndMinutes, startOfDay } from './date'
import { generateId } from './id'

/** Sample events mirroring the reference screenshot, positioned relative to `today`. */
export function createSeedEvents(today: Date): CalendarEvent[] {
  const day = startOfDay(today)
  const make = (
    offset: number,
    from: number,
    to: number,
    title: string,
    description: string,
  ): CalendarEvent => ({
    id: generateId(),
    title,
    description,
    start: dateFromDayAndMinutes(addDays(day, offset), from),
    end: dateFromDayAndMinutes(addDays(day, offset), to),
  })

  return [
    make(2, 5 * 60, 6 * 60 + 15, 'Task A1', 'Review pull requests and plan the sprint.'),
    make(3, 2 * 60 + 15, 3 * 60 + 15, 'Task A2', 'Write documentation for the calendar module.'),
    make(4, 6 * 60, 7 * 60 + 15, 'Task A3', 'Pair programming session on drag & drop.'),
  ]
}
