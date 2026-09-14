import { fromDateTimeLocal } from './date'

export interface EventFormValues {
  title: string
  description: string
  /** datetime-local string */
  start: string
  /** datetime-local string */
  end: string
}

export type EventFormErrors = Partial<Record<keyof EventFormValues, string>>

export function validateEventForm(values: EventFormValues): EventFormErrors {
  const errors: EventFormErrors = {}
  if (!values.title.trim()) errors.title = 'Title is required.'

  const start = fromDateTimeLocal(values.start)
  const end = fromDateTimeLocal(values.end)
  if (!start) errors.start = 'Start time is required.'
  if (!end) errors.end = 'End time is required.'
  if (start && end && end <= start) errors.end = 'End time must be after start time.'

  return errors
}
