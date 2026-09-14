import { HOUR_HEIGHT } from '../../utils/layout'

const LINES = Array.from({ length: 23 }, (_, i) => i + 1)

/** Horizontal hour separators, drawn once behind all day columns. */
export function HourLines() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {LINES.map((hour) => (
        <div
          key={hour}
          className="absolute inset-x-0 border-t border-[#dadce0]"
          style={{ top: hour * HOUR_HEIGHT }}
        />
      ))}
    </div>
  )
}
