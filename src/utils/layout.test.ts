import { describe, expect, it } from 'vitest'
import type { CalendarEvent } from '../types/event'
import { HOUR_HEIGHT, eventsForDay, getEventGeometry, layoutDayEvents, pointToSlot } from './layout'

const day = new Date(2026, 8, 17)

function ev(id: string, from: [number, number], to: [number, number], dayOffset = 0): CalendarEvent {
  return {
    id,
    title: id,
    description: '',
    start: new Date(2026, 8, 17 + dayOffset, from[0], from[1]),
    end: new Date(2026, 8, 17 + dayOffset, to[0], to[1]),
  }
}

describe('getEventGeometry', () => {
  it('computes top and height from start/end', () => {
    const g = getEventGeometry(ev('a', [5, 0], [6, 15]), day)
    expect(g.top).toBe(5 * HOUR_HEIGHT)
    expect(g.height).toBe(1.25 * HOUR_HEIGHT)
  })

  it('clips an event that spans midnight to the day column', () => {
    const e = { ...ev('a', [22, 0], [2, 0]), end: new Date(2026, 8, 18, 2, 0) }
    const g = getEventGeometry(e, day)
    expect(g.startMinutes).toBe(22 * 60)
    expect(g.endMinutes).toBe(24 * 60)
    expect(g.height).toBe(2 * HOUR_HEIGHT)

    const next = getEventGeometry(e, new Date(2026, 8, 18))
    expect(next.top).toBe(0)
    expect(next.height).toBe(2 * HOUR_HEIGHT)
  })

  it('enforces a minimum visual height', () => {
    const g = getEventGeometry(ev('a', [5, 0], [5, 5]), day)
    expect(g.height).toBe(0.25 * HOUR_HEIGHT)
  })
})

describe('eventsForDay', () => {
  it('includes events overlapping the day and excludes others', () => {
    const list = [ev('today', [9, 0], [10, 0]), ev('tomorrow', [9, 0], [10, 0], 1)]
    expect(eventsForDay(list, day).map((e) => e.id)).toEqual(['today'])
  })
})

describe('layoutDayEvents', () => {
  it('gives non-overlapping events the full width', () => {
    const out = layoutDayEvents([ev('a', [9, 0], [10, 0]), ev('b', [11, 0], [12, 0])], day)
    expect(out.map((p) => [p.column, p.columns])).toEqual([
      [0, 1],
      [0, 1],
    ])
  })

  it('splits two overlapping events into two columns', () => {
    const out = layoutDayEvents([ev('a', [9, 0], [10, 0]), ev('b', [9, 30], [10, 30])], day)
    expect(out.find((p) => p.event.id === 'a')).toMatchObject({ column: 0, columns: 2 })
    expect(out.find((p) => p.event.id === 'b')).toMatchObject({ column: 1, columns: 2 })
  })

  it('chains overlaps into a three-column cluster', () => {
    const out = layoutDayEvents(
      [ev('a', [9, 0], [11, 0]), ev('b', [9, 30], [10, 30]), ev('c', [10, 0], [12, 0])],
      day,
    )
    expect(out.every((p) => p.columns === 3)).toBe(true)
    expect(new Set(out.map((p) => p.column)).size).toBe(3)
  })

  it('does not treat touching events as overlapping', () => {
    const out = layoutDayEvents([ev('a', [9, 0], [10, 0]), ev('b', [10, 0], [11, 0])], day)
    expect(out.every((p) => p.columns === 1)).toBe(true)
  })

  it('reuses a freed column inside a cluster', () => {
    // a overlaps b; c starts after b ends but still overlaps a → c reuses column 1
    const out = layoutDayEvents(
      [ev('a', [9, 0], [12, 0]), ev('b', [9, 0], [10, 0]), ev('c', [10, 30], [11, 0])],
      day,
    )
    expect(out.find((p) => p.event.id === 'c')).toMatchObject({ column: 1, columns: 2 })
  })
})

describe('pointToSlot', () => {
  const rect = { left: 100, top: 50, width: 700, height: 1440 } as DOMRect

  it('maps x to the day index and y to minutes', () => {
    expect(pointToSlot(rect, 100, 50, 7)).toEqual({ dayIndex: 0, minutes: 0 })
    expect(pointToSlot(rect, 100 + 350, 50 + 5 * HOUR_HEIGHT, 7)).toEqual({ dayIndex: 3, minutes: 300 })
  })

  it('clamps outside the grid', () => {
    expect(pointToSlot(rect, 0, -100, 7)).toEqual({ dayIndex: 0, minutes: 0 })
    expect(pointToSlot(rect, 5000, 5000, 7)).toEqual({ dayIndex: 6, minutes: 1440 })
  })
})
