import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  /** Accessible name for the dialog. */
  title: string
  children: ReactNode
}

/** Centered dialog with backdrop. Closes on Escape or backdrop click; traps Tab inside. */
export function Modal({ open, onClose, title, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    const previouslyFocused = document.activeElement as HTMLElement | null

    const focusable = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'input, textarea, select, button, [href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => !el.hasAttribute('disabled'))

    const first = panel?.querySelector<HTMLElement>('[data-autofocus]') ?? focusable()[0] ?? panel
    first?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusable()
      if (items.length === 0) return
      const firstItem = items[0]
      const lastItem = items[items.length - 1]
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault()
        lastItem.focus()
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault()
        firstItem.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      data-testid="modal-backdrop"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="w-full max-w-md rounded-lg bg-white shadow-[0_8px_28px_rgba(0,0,0,0.28)] outline-none"
      >
        {children}
      </div>
    </div>
  )
}
