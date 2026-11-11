import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface FieldProps {
  label: string
  children: ReactNode
  hint?: string
  wide?: boolean
}
export function Field({ label, children, hint, wide = false }: FieldProps) {
  return (
    <label
      className={cn(
        'flex min-w-0 flex-col gap-2 text-xs font-medium text-secondary [&_select]:w-full',
        wide && 'col-span-full',
      )}
    >
      <span>{label}</span>
      {children}
      {hint && <small className="text-[11px] leading-normal font-normal text-muted">{hint}</small>}
    </label>
  )
}
