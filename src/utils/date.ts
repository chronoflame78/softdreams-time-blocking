export const MINUTES_PER_DAY = 24 * 60
export const DAYS_IN_VIEW = 7

const WEEKDAY_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const WEEKDAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000)
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** The visible range: `today` plus the following 6 days, each at 00:00. */
export function getWeekDays(today: Date, count = DAYS_IN_VIEW): Date[] {
  const first = startOfDay(today)
  return Array.from({ length: count }, (_, i) => addDays(first, i))
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0')
}

/** "HH:mm" (24h). */
export function formatTime(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

/** "05:00 – 06:15" */
export function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)} – ${formatTime(end)}`
}

export function formatWeekdayShort(date: Date): string {
  return WEEKDAY_SHORT[date.getDay()]
}

/** "THU 20" */
export function formatDayHeader(date: Date): string {
  return `${formatWeekdayShort(date)} ${date.getDate()}`
}

/** "Thursday, 20 September 2026" */
export function formatFullDate(date: Date): string {
  return `${WEEKDAY_LONG[date.getDay()]}, ${date.getDate()} ${MONTH_LONG[date.getMonth()]} ${date.getFullYear()}`
}

/** "September 2026" */
export function formatMonthYear(date: Date): string {
  return `${MONTH_LONG[date.getMonth()]} ${date.getFullYear()}`
}

/** "GMT+07" / "GMT-05" / "GMT+05:30" for the local timezone. */
export function formatTimezone(date: Date = new Date()): string {
  const offset = -date.getTimezoneOffset()
  const sign = offset >= 0 ? '+' : '-'
  const abs = Math.abs(offset)
  const hours = pad2(Math.floor(abs / 60))
  const mins = abs % 60
  return `GMT${sign}${hours}${mins ? `:${pad2(mins)}` : ''}`
}

/** Round to the nearest slot (default 15 min). */
export function snapToSlot(minutes: number, slot = 15): number {
  return Math.round(minutes / slot) * slot
}

/** Round down to the containing slot. */
export function floorToSlot(minutes: number, slot = 15): number {
  return Math.floor(minutes / slot) * slot
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Minutes elapsed since 00:00 of the same day. */
export function minutesFromDayStart(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

/** Build a Date from a day (any time) and a minute offset from its 00:00. */
export function dateFromDayAndMinutes(day: Date, minutes: number): Date {
  const d = startOfDay(day)
  d.setMinutes(minutes)
  return d
}

/** Minutes between two dates (may be fractional). */
export function diffMinutes(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / 60_000
}

/** Date → value for an <input type="datetime-local"> ("YYYY-MM-DDTHH:mm", local time). */
export function toDateTimeLocal(date: Date): string {
  return (
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}` +
    `T${pad2(date.getHours())}:${pad2(date.getMinutes())}`
  )
}

/** "YYYY-MM-DDTHH:mm" (local) → Date, or null when the string is invalid. */
export function fromDateTimeLocal(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value)
  if (!m) return null
  const [, y, mo, d, h, mi] = m.map(Number)
  const date = new Date(y, mo - 1, d, h, mi, 0, 0)
  return Number.isNaN(date.getTime()) ? null : date
}
