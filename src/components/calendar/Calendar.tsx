import { useCallback, useMemo, useRef, useState, type MouseEvent } from 'react'
import { useDragToCreate } from '../../hooks/useDragToCreate'
import { useDragToMove } from '../../hooks/useDragToMove'
import { useEvents } from '../../hooks/useEvents'
import { useNow } from '../../hooks/useNow'
import type { CalendarEvent, EventDraft, TimeRange } from '../../types/event'
import { getWeekDays, startOfDay } from '../../utils/date'
import { EventDetailDialog } from '../dialogs/EventDetailDialog'
import { EventFormDialog } from '../dialogs/EventFormDialog'
import { ContextMenu } from '../ui/ContextMenu'
import { CalendarGrid } from './CalendarGrid'
import { CalendarHeader } from './CalendarHeader'
import { CalendarToolbar } from './CalendarToolbar'

type DialogState =
  | { kind: 'create'; range: TimeRange }
  | { kind: 'detail'; eventId: string }
  | { kind: 'edit'; eventId: string }
  | null

interface MenuState {
  x: number
  y: number
  eventId: string
}

/** 7-day time-blocking calendar: owns event state, drag interactions, dialogs and the context menu. */
export function Calendar() {
  const { events, addEvent, updateEvent, removeEvent, moveEvent } = useEvents()
  const now = useNow()
  const todayKey = startOfDay(now).getTime()
  const days = useMemo(() => getWeekDays(new Date(todayKey)), [todayKey])

  const [dialog, setDialog] = useState<DialogState>(null)
  const [menu, setMenu] = useState<MenuState | null>(null)
  const closeDialog = useCallback(() => setDialog(null), [])
  const closeMenu = useCallback(() => setMenu(null), [])

  const gridRef = useRef<HTMLDivElement>(null)

  const { selection, onPointerDown: onGridPointerDown } = useDragToCreate({
    gridRef,
    days,
    onSelect: (range) => setDialog({ kind: 'create', range }),
  })

  const { preview, onEventPointerDown } = useDragToMove({
    gridRef,
    days,
    onMove: moveEvent,
    onClick: (event) => setDialog({ kind: 'detail', eventId: event.id }),
  })

  // While dragging, show the event at its tentative position instead of the original.
  const displayEvents = useMemo(
    () => (preview ? events.map((e) => (e.id === preview.id ? preview : e)) : events),
    [events, preview],
  )

  const onEventContextMenu = useCallback((e: MouseEvent<HTMLElement>, event: CalendarEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setMenu({ x: e.clientX, y: e.clientY, eventId: event.id })
  }, [])

  const dialogEvent = dialog && dialog.kind !== 'create' ? events.find((e) => e.id === dialog.eventId) : undefined
  const menuEvent = menu ? events.find((e) => e.id === menu.eventId) : undefined

  const handleCreate = (draft: EventDraft) => {
    addEvent(draft)
    closeDialog()
  }

  const handleEdit = (id: string) => (draft: EventDraft) => {
    updateEvent(id, draft)
    closeDialog()
  }

  const handleDelete = (id: string) => {
    removeEvent(id)
    closeDialog()
  }

  return (
    <div className="flex h-full flex-col bg-white text-[#3c4043]">
      <CalendarToolbar days={days} />
      <CalendarHeader days={days} today={now} />
      <CalendarGrid
        days={days}
        events={displayEvents}
        now={now}
        gridRef={gridRef}
        selection={selection}
        draggingId={preview?.id ?? null}
        onGridPointerDown={onGridPointerDown}
        onEventPointerDown={onEventPointerDown}
        onEventContextMenu={onEventContextMenu}
      />

      {dialog?.kind === 'create' && (
        <EventFormDialog
          mode="create"
          initial={{ title: '', description: '', ...dialog.range }}
          onSubmit={handleCreate}
          onClose={closeDialog}
        />
      )}
      {dialog?.kind === 'edit' && dialogEvent && (
        <EventFormDialog mode="edit" initial={dialogEvent} onSubmit={handleEdit(dialogEvent.id)} onClose={closeDialog} />
      )}
      {dialog?.kind === 'detail' && dialogEvent && (
        <EventDetailDialog
          event={dialogEvent}
          onEdit={() => setDialog({ kind: 'edit', eventId: dialogEvent.id })}
          onDelete={() => handleDelete(dialogEvent.id)}
          onClose={closeDialog}
        />
      )}

      {menu && menuEvent && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onClose={closeMenu}
          items={[
            { label: 'Edit', icon: <PencilIcon />, onSelect: () => setDialog({ kind: 'edit', eventId: menuEvent.id }) },
            { label: 'Delete', icon: <TrashIcon />, danger: true, onSelect: () => removeEvent(menuEvent.id) },
          ]}
        />
      )}
    </div>
  )
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  )
}
