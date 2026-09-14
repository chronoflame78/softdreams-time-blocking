import { describe, expect, it } from 'vitest'
import {
  addDays,
  addMinutes,
  dateFromDayAndMinutes,
  diffMinutes,
  floorToSlot,
  formatDayHeader,
  formatFullDate,
  formatTime,
  formatTimeRange,
  formatTimezone,
  fromDateTimeLocal,
  getWeekDays,
  isSameDay,
  minutesFromDayStart,
  snapToSlot,
  startOfDay,
  toDateTimeLocal,
} from './date'

describe('startOfDay', () => {
  it('zeroes hours, minutes, seconds and milliseconds', () => {
    const d = startOfDay(new Date(2026, 8, 17, 13, 45, 30, 500))
    expect(d.getHours()).toBe(0)
    expect(d.getMinutes()).toBe(0)
    expect(d.getSeconds()).toBe(0)
    expect(d.getMilliseconds()).toBe(0)
    expect(d.getDate()).toBe(17)
  })

  it('does not mutate the input', () => {
    const input = new Date(2026, 8, 17, 13, 45)
    startOfDay(input)
    expect(input.getHours()).toBe(13)
  })
})

describe('addDays / addMinutes', () => {
  it('adds days across a month boundary', () => {
    const d = addDays(new Date(2026, 8, 29), 3)
    expect([d.getMonth(), d.getDate()]).toEqual([9, 2])
  })

  it('adds minutes across midnight', () => {
    const d = addMinutes(new Date(2026, 8, 17, 23, 50), 20)
    expect([d.getDate(), d.getHours(), d.getMinutes()]).toEqual([18, 0, 10])
  })
})

describe('isSameDay', () => {
  it('is true for different times on the same date', () => {
    expect(isSameDay(new Date(2026, 8, 17, 1), new Date(2026, 8, 17, 23, 59))).toBe(true)
  })
  it('is false across midnight', () => {
    expect(isSameDay(new Date(2026, 8, 17, 23, 59), new Date(2026, 8, 18, 0, 0))).toBe(false)
  })
})

describe('getWeekDays', () => {
  it('returns 7 consecutive days starting from today at 00:00', () => {
    const days = getWeekDays(new Date(2026, 8, 17, 15, 30))
    expect(days).toHaveLength(7)
    expect(days[0].getTime()).toBe(new Date(2026, 8, 17).getTime())
    days.forEach((d, i) => {
      expect(d.getHours()).toBe(0)
      if (i > 0) expect(diffMinutes(days[i - 1], d)).toBe(24 * 60)
    })
    expect(days[6].getDate()).toBe(23)
  })
})

describe('formatting', () => {
  it('formatTime pads to HH:mm', () => {
    expect(formatTime(new Date(2026, 8, 17, 5, 7))).toBe('05:07')
    expect(formatTime(new Date(2026, 8, 17, 23, 0))).toBe('23:00')
  })

  it('formatTimeRange uses an en dash', () => {
    expect(formatTimeRange(new Date(2026, 8, 17, 5, 0), new Date(2026, 8, 17, 6, 15))).toBe('05:00 – 06:15')
  })

  it('formatDayHeader gives weekday + day number', () => {
    expect(formatDayHeader(new Date(2026, 8, 17))).toBe('THU 17')
  })

  it('formatFullDate spells out the date', () => {
    expect(formatFullDate(new Date(2026, 8, 17))).toBe('Thursday, 17 September 2026')
  })

  it('formatTimezone produces GMT±HH', () => {
    expect(formatTimezone(new Date(2026, 8, 17))).toMatch(/^GMT[+-]\d{2}(:\d{2})?$/)
  })
})

describe('snapping', () => {
  it('snapToSlot rounds to the nearest 15 minutes', () => {
    expect(snapToSlot(0)).toBe(0)
    expect(snapToSlot(7)).toBe(0)
    expect(snapToSlot(8)).toBe(15)
    expect(snapToSlot(59)).toBe(60)
    expect(snapToSlot(100, 30)).toBe(90)
  })

  it('floorToSlot rounds down', () => {
    expect(floorToSlot(14)).toBe(0)
    expect(floorToSlot(29)).toBe(15)
    expect(floorToSlot(30)).toBe(30)
  })
})

describe('day/minute conversion', () => {
  it('round-trips minutesFromDayStart ↔ dateFromDayAndMinutes', () => {
    const day = new Date(2026, 8, 17, 9, 9) // any time on the day
    const date = dateFromDayAndMinutes(day, 6 * 60 + 15)
    expect(formatTime(date)).toBe('06:15')
    expect(date.getDate()).toBe(17)
    expect(minutesFromDayStart(date)).toBe(375)
  })
})

describe('datetime-local conversion', () => {
  it('round-trips through the input format', () => {
    const d = new Date(2026, 0, 5, 7, 3)
    const str = toDateTimeLocal(d)
    expect(str).toBe('2026-01-05T07:03')
    expect(fromDateTimeLocal(str)?.getTime()).toBe(d.getTime())
  })

  it('returns null for malformed input', () => {
    expect(fromDateTimeLocal('')).toBeNull()
    expect(fromDateTimeLocal('2026-01-05')).toBeNull()
    expect(fromDateTimeLocal('not a date')).toBeNull()
  })
})
