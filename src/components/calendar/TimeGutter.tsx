import { GRID_HEIGHT, HOUR_HEIGHT } from '../../utils/layout'

const HOURS = Array.from({ length: 23 }, (_, i) => i + 1)

/** Left column with "01:00" … "23:00" labels aligned to the hour lines. */
export function TimeGutter() {
  return (
    <div className="relative w-16 shrink-0" style={{ height: GRID_HEIGHT }} data-testid="time-gutter">
      {HOURS.map((hour) => (
        <span
          key={hour}
          className="absolute right-3 -translate-y-1/2 text-[10px] text-[#70757a]"
          style={{ top: hour * HOUR_HEIGHT }}
        >
          {hour.toString().padStart(2, '0')}:00
        </span>
      ))}
    </div>
  )
}
