import { describe, expect, it } from 'vitest'
import { validateEventForm } from './validation'

const valid = {
  title: 'Standup',
  description: '',
  start: '2026-09-17T09:00',
  end: '2026-09-17T09:30',
}

describe('validateEventForm', () => {
  it('accepts valid input', () => {
    expect(validateEventForm(valid)).toEqual({})
  })

  it('requires a non-blank title', () => {
    expect(validateEventForm({ ...valid, title: '   ' }).title).toBe('Title is required.')
  })

  it('requires end after start', () => {
    expect(validateEventForm({ ...valid, end: valid.start }).end).toMatch(/after start/)
    expect(validateEventForm({ ...valid, end: '2026-09-17T08:00' }).end).toMatch(/after start/)
  })

  it('reports missing dates', () => {
    const errors = validateEventForm({ ...valid, start: '', end: '' })
    expect(errors.start).toBeDefined()
    expect(errors.end).toBeDefined()
  })
})
