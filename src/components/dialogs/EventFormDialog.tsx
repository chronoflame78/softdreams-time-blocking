import { useState, type FormEvent } from 'react'
import type { EventDraft } from '../../types/event'
import { fromDateTimeLocal, toDateTimeLocal } from '../../utils/date'
import { validateEventForm, type EventFormErrors, type EventFormValues } from '../../utils/validation'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { FormField } from './FormField'

interface EventFormDialogProps {
  mode: 'create' | 'edit'
  initial: EventDraft
  onSubmit: (draft: EventDraft) => void
  onClose: () => void
}

function toValues(draft: EventDraft): EventFormValues {
  return {
    title: draft.title,
    description: draft.description,
    start: toDateTimeLocal(draft.start),
    end: toDateTimeLocal(draft.end),
  }
}

/** Create / edit form. Validation: title required, end after start. */
export function EventFormDialog({ mode, initial, onSubmit, onClose }: EventFormDialogProps) {
  const [values, setValues] = useState<EventFormValues>(() => toValues(initial))
  const [errors, setErrors] = useState<EventFormErrors>({})
  const heading = mode === 'create' ? 'New event' : 'Edit event'

  const set = (field: keyof EventFormValues) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const nextErrors = validateEventForm(values)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      start: fromDateTimeLocal(values.start)!,
      end: fromDateTimeLocal(values.end)!,
    })
  }

  return (
    <Modal open onClose={onClose} title={heading}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 p-6">
        <h2 className="text-lg font-medium text-[#3c4043]">{heading}</h2>

        <FormField label="Title" htmlFor="event-title" error={errors.title}>
          <input
            id="event-title"
            name="title"
            type="text"
            value={values.title}
            onChange={(e) => set('title')(e.target.value)}
            placeholder="Add title"
            autoComplete="off"
            className="field"
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Start" htmlFor="event-start" error={errors.start}>
            <input
              id="event-start"
              name="start"
              type="datetime-local"
              value={values.start}
              onChange={(e) => set('start')(e.target.value)}
              className="field"
            />
          </FormField>
          <FormField label="End" htmlFor="event-end" error={errors.end}>
            <input
              id="event-end"
              name="end"
              type="datetime-local"
              value={values.end}
              onChange={(e) => set('end')(e.target.value)}
              className="field"
            />
          </FormField>
        </div>

        <FormField label="Description" htmlFor="event-description" error={errors.description}>
          <textarea
            id="event-description"
            name="description"
            rows={3}
            value={values.description}
            onChange={(e) => set('description')(e.target.value)}
            placeholder="Add description"
            className="field resize-y"
          />
        </FormField>

        <div className="mt-2 flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}
