import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'text' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const styles: Record<Variant, string> = {
  primary: 'bg-[#1a73e8] text-white hover:bg-[#1765cc] shadow-sm',
  text: 'text-[#1a73e8] hover:bg-[#e8f0fe]',
  danger: 'text-[#d93025] hover:bg-[#fce8e6]',
}

export function Button({ variant = 'text', className = '', type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={`rounded px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]/40 ${styles[variant]} ${className}`}
      {...rest}
    />
  )
}
