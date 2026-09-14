import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
}

/** Label + control + inline error message. */
export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-xs font-medium text-[#5f6368]">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-[#d93025]">
          {error}
        </p>
      )}
    </div>
  )
}
