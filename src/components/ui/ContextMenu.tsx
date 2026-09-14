import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

export interface ContextMenuItem {
  label: string
  onSelect: () => void
  icon?: ReactNode
  /** Render in the "danger" colour (e.g. Delete). */
  danger?: boolean
}

interface ContextMenuProps {
  /** Viewport coordinates where the menu should appear. */
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

/** Floating menu anchored at a viewport point. Closes on outside press, Escape, scroll or resize. */
export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ left: x, top: y })

  // Keep the menu inside the viewport.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    const left = Math.min(x, window.innerWidth - width - 8)
    const top = Math.min(y, window.innerHeight - height - 8)
    setPosition({ left: Math.max(8, left), top: Math.max(8, top) })
  }, [x, y])

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()

    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', onClose, true)
    window.addEventListener('resize', onClose)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', onClose, true)
      window.removeEventListener('resize', onClose)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      role="menu"
      style={position}
      className="fixed z-50 min-w-40 rounded-md bg-white py-1.5 text-sm text-[#3c4043] shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          role="menuitem"
          onClick={() => {
            item.onSelect()
            onClose()
          }}
          className={`flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-[#f1f3f4] focus:bg-[#f1f3f4] focus:outline-none ${
            item.danger ? 'text-[#d93025]' : ''
          }`}
        >
          {item.icon && <span className="flex h-4 w-4 items-center justify-center">{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </div>
  )
}
