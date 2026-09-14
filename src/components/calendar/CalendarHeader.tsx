import { formatTimezone, formatWeekdayShort, isSameDay } from '../../utils/date'

interface CalendarHeaderProps {
  days: Date[]
  today: Date
}

/** Day-of-week + day-number row, with today highlighted in a blue circle. */
export function CalendarHeader({ days, today }: CalendarHeaderProps) {
  return (
    <div className="flex shrink-0 overflow-y-hidden border-b border-[#dadce0] [scrollbar-gutter:stable]" data-testid="calendar-header">
      <div className="flex w-16 shrink-0 flex-col justify-end">
        <span className="pb-7 pr-1 text-right text-[10px] text-[#70757a]">{formatTimezone(today)}</span>
      </div>
      {days.map((day) => {
        const isToday = isSameDay(day, today)
        return (
          <div
            key={day.toISOString()}
            className="flex flex-1 flex-col items-center border-l border-transparent pt-2"
            data-testid="day-header"
            data-today={isToday || undefined}
          >
            <span
              className={`text-[11px] font-medium tracking-wide ${isToday ? 'text-[#1a73e8]' : 'text-[#70757a]'}`}
            >
              {formatWeekdayShort(day)}
            </span>
            <span
              className={`mt-1 flex h-[46px] w-[46px] items-center justify-center rounded-full text-[26px] leading-none ${
                isToday ? 'bg-[#1a73e8] text-white' : 'text-[#3c4043] hover:bg-[#f1f3f4]'
              }`}
            >
              {day.getDate()}
            </span>
            <span className="mt-2 h-5 w-full border-l border-[#dadce0]" aria-hidden="true" />
          </div>
        )
      })}
    </div>
  )
}
