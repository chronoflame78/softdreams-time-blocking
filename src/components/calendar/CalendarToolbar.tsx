import { formatMonthYear } from '../../utils/date'

interface CalendarToolbarProps {
  days: Date[]
}

/** Slim top bar: app name, the month(s) in view and a usage hint. */
export function CalendarToolbar({ days }: CalendarToolbarProps) {
  const first = days[0]
  const last = days[days.length - 1]
  const title =
    first.getMonth() === last.getMonth()
      ? formatMonthYear(first)
      : `${formatMonthYear(first)} – ${formatMonthYear(last)}`

  return (
    <header className="flex shrink-0 items-center gap-4 border-b border-[#dadce0] px-4 py-2">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded bg-[#1a73e8] text-sm font-bold text-white" aria-hidden="true">
          {first.getDate()}
        </span>
        <span className="text-lg text-[#5f6368]">Calendar</span>
      </div>
      <h1 className="text-xl font-normal text-[#3c4043]">{title}</h1>
      <p className="ml-auto hidden text-xs text-[#70757a] sm:block">
        Drag on empty space to create · drag an event to move · right-click for options
      </p>
    </header>
  )
}
