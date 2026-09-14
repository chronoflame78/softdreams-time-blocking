import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { STORAGE_KEY } from '../utils/storage'
import { useEvents } from './useEvents'

const draft = {
  title: 'Standup',
  description: 'Daily sync',
  start: new Date(2026, 8, 17, 9, 0),
  end: new Date(2026, 8, 17, 9, 30),
}

describe('useEvents', () => {
  it('seeds sample events when storage is empty', () => {
    const { result } = renderHook(() => useEvents())
    expect(result.current.events).toHaveLength(3)
    expect(result.current.events.map((e) => e.title)).toEqual(['Task A1', 'Task A2', 'Task A3'])
  })

  it('adds an event with a generated id', () => {
    const { result } = renderHook(() => useEvents())
    let created!: { id: string }
    act(() => {
      created = result.current.addEvent(draft)
    })
    expect(created.id).toBeTruthy()
    expect(result.current.events).toHaveLength(4)
    expect(result.current.events.at(-1)).toMatchObject({ ...draft, id: created.id })
  })

  it('updates only the target event', () => {
    const { result } = renderHook(() => useEvents())
    const [first, second] = result.current.events
    act(() => result.current.updateEvent(first.id, { title: 'Renamed' }))
    expect(result.current.events[0]).toMatchObject({ id: first.id, title: 'Renamed', description: first.description })
    expect(result.current.events[1]).toEqual(second)
  })

  it('removes an event by id', () => {
    const { result } = renderHook(() => useEvents())
    const [first] = result.current.events
    act(() => result.current.removeEvent(first.id))
    expect(result.current.events.find((e) => e.id === first.id)).toBeUndefined()
    expect(result.current.events).toHaveLength(2)
  })

  it('moves an event to a new start/end', () => {
    const { result } = renderHook(() => useEvents())
    const [first] = result.current.events
    const start = new Date(2026, 8, 20, 14, 0)
    const end = new Date(2026, 8, 20, 15, 15)
    act(() => result.current.moveEvent(first.id, start, end))
    expect(result.current.events[0].start.getTime()).toBe(start.getTime())
    expect(result.current.events[0].end.getTime()).toBe(end.getTime())
  })

  it('persists to localStorage and rehydrates on the next mount', () => {
    const first = renderHook(() => useEvents())
    act(() => {
      first.result.current.addEvent(draft)
    })
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toHaveLength(4)
    first.unmount()

    const second = renderHook(() => useEvents())
    expect(second.result.current.events).toHaveLength(4)
    const restored = second.result.current.events.at(-1)!
    expect(restored.title).toBe('Standup')
    expect(restored.start).toBeInstanceOf(Date)
    expect(restored.start.getTime()).toBe(draft.start.getTime())
  })

  it('does not re-seed when stored data exists (even an empty list)', () => {
    localStorage.setItem(STORAGE_KEY, '[]')
    const { result } = renderHook(() => useEvents())
    expect(result.current.events).toHaveLength(0)
  })

  it('falls back to seed data when storage is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    const { result } = renderHook(() => useEvents())
    expect(result.current.events).toHaveLength(3)
  })
})
