import { useCallback, useEffect, useReducer } from 'react'
import type { CalendarEvent, EventDraft } from '../types/event'
import { generateId } from '../utils/id'
import { createSeedEvents } from '../utils/seed'
import { loadEvents, saveEvents } from '../utils/storage'

type Action =
  | { type: 'add'; event: CalendarEvent }
  | { type: 'update'; id: string; changes: Partial<EventDraft> }
  | { type: 'remove'; id: string }
  | { type: 'move'; id: string; start: Date; end: Date }

function reducer(state: CalendarEvent[], action: Action): CalendarEvent[] {
  switch (action.type) {
    case 'add':
      return [...state, action.event]
    case 'update':
      return state.map((e) => (e.id === action.id ? { ...e, ...action.changes } : e))
    case 'remove':
      return state.filter((e) => e.id !== action.id)
    case 'move':
      return state.map((e) => (e.id === action.id ? { ...e, start: action.start, end: action.end } : e))
  }
}

function init(): CalendarEvent[] {
  return loadEvents() ?? createSeedEvents(new Date())
}

export function useEvents() {
  const [events, dispatch] = useReducer(reducer, undefined, init)

  useEffect(() => {
    saveEvents(events)
  }, [events])

  const addEvent = useCallback((draft: EventDraft): CalendarEvent => {
    const event: CalendarEvent = { id: generateId(), ...draft }
    dispatch({ type: 'add', event })
    return event
  }, [])

  const updateEvent = useCallback((id: string, changes: Partial<EventDraft>) => {
    dispatch({ type: 'update', id, changes })
  }, [])

  const removeEvent = useCallback((id: string) => {
    dispatch({ type: 'remove', id })
  }, [])

  const moveEvent = useCallback((id: string, start: Date, end: Date) => {
    dispatch({ type: 'move', id, start, end })
  }, [])

  return { events, addEvent, updateEvent, removeEvent, moveEvent }
}
