import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getWeekDays } from '../../utils/date'
import { CalendarHeader } from './CalendarHeader'
import { TimeGutter } from './TimeGutter'

describe('CalendarHeader', () => {
  it('renders 7 day headers starting from today and highlights today', () => {
    const today = new Date(2026, 8, 17, 8, 40)
    render(<CalendarHeader days={getWeekDays(today)} today={today} />)

    const headers = screen.getAllByTestId('day-header')
    expect(headers).toHaveLength(7)
    expect(headers[0]).toHaveTextContent('THU')
    expect(headers[0]).toHaveTextContent('17')
    expect(headers[0]).toHaveAttribute('data-today', 'true')
    expect(headers[6]).toHaveTextContent('WED')
    expect(headers[6]).toHaveTextContent('23')
    expect(headers[1]).not.toHaveAttribute('data-today')
    expect(screen.getByText(/^GMT[+-]\d{2}/)).toBeInTheDocument()
  })
})

describe('TimeGutter', () => {
  it('renders hour labels 01:00 … 23:00', () => {
    render(<TimeGutter />)
    const labels = screen.getAllByText(/^\d{2}:00$/)
    expect(labels).toHaveLength(23)
    expect(labels[0]).toHaveTextContent('01:00')
    expect(labels[22]).toHaveTextContent('23:00')
    expect(screen.queryByText('00:00')).toBeNull()
  })
})
