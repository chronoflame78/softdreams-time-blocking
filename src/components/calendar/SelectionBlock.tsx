import type { TimeRange } from '../../types/event'
import { formatTimeRange } from '../../utils/date'
import { getEventGeometry } from '../../utils/layout'

interface SelectionBlockProps {
  range: TimeRange
  day: Date
}

/** Ghost block shown while the user drags across empty space to create an event. */
export function SelectionBlock({ range, day }: SelectionBlockProps) {
  const { top, height } = getEventGeometry({ id: 'selection', title: '', description: '', ...range }, day)
  return (
    <div
      className="pointer-events-none absolute left-0 z-10 overflow-hidden rounded bg-[#e4c441]/90 px-2 py-1 text-xs leading-4 text-white shadow-[0_2px_6px_rgba(0,0,0,0.2)]"
      style={{ top, height, width: 'calc(100% - 8px)' }}
      data-testid="selection-block"
    >
      <p className="truncate font-medium">(No title)</p>
      {height >= 36 && <p className="truncate">{formatTimeRange(range.start, range.end)}</p>}
    </div>
  )
}
