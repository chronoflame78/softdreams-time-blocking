import type { CalendarEvent } from '../../types/event'
import { formatFullDate, formatTime, formatTimeRange, isSameDay } from '../../utils/date'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface EventDetailDialogProps {
  event: CalendarEvent
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

function formatWhen(event: CalendarEvent): string {
  if (isSameDay(event.start, event.end)) {
    return `${formatFullDate(event.start)} · ${formatTimeRange(event.start, event.end)}`
  }
  return `${formatFullDate(event.start)} ${formatTime(event.start)} → ${formatFullDate(event.end)} ${formatTime(event.end)}`
}

/** Read-only view of an event, opened by left-clicking a block. */
export function EventDetailDialog({ event, onEdit, onDelete, onClose }: EventDetailDialogProps) {
  return (
    <Modal open onClose={onClose} title={`Event: ${event.title}`}>
      <div className="p-6">
        <div className="flex items-start gap-3">
          <span className="mt-1.5 h-4 w-4 shrink-0 rounded bg-[#e4c441]" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h2 className="break-words text-xl font-normal leading-7 text-[#3c4043]">{event.title}</h2>
            <p className="mt-1 text-sm text-[#5f6368]">{formatWhen(event)}</p>
          </div>
        </div>

        {event.description ? (
          <p className="mt-4 whitespace-pre-wrap break-words pl-7 text-sm text-[#3c4043]">{event.description}</p>
        ) : (
          <p className="mt-4 pl-7 text-sm italic text-[#80868b]">No description</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="danger" onClick={onDelete}>
            Delete
          </Button>
          <Button onClick={onEdit}>Edit</Button>
          <Button variant="primary" onClick={onClose} data-autofocus>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
