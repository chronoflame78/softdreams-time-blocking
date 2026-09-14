import { minutesToPx, nowOffsetMinutes } from '../../utils/layout'

interface CurrentTimeLineProps {
  now: Date
}

/** Red "now" indicator: a dot on the column edge and a line across the column. */
export function CurrentTimeLine({ now }: CurrentTimeLineProps) {
  const top = minutesToPx(nowOffsetMinutes(now))
  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-20 h-0.5 bg-[#ea4335]"
      style={{ top }}
      data-testid="current-time-line"
      aria-hidden="true"
    >
      <span className="absolute -left-1.5 -top-[5px] h-3 w-3 rounded-full bg-[#ea4335]" />
    </div>
  )
}
