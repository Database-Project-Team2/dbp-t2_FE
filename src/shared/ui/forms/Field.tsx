import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface FieldProps {
  label: string
  inputId?: string
  children: ReactNode
  hint?: string
  wide?: boolean
  error?: string
  success?: string
  messageId?: string
}
export function Field({
  label,
  inputId,
  children,
  hint,
  wide = false,
  error,
  success,
  messageId,
}: FieldProps) {
  const Container = inputId ? 'div' : 'label'
  return (
    <Container
      className={cn(
        'flex min-w-0 flex-col gap-2 text-xs font-medium text-secondary [&_select]:w-full',
        wide && 'col-span-full',
      )}
    >
      {inputId ? <label htmlFor={inputId}>{label}</label> : <span>{label}</span>}
      {children}
      {(error || success || hint) && (
        <small
          id={messageId}
          aria-live="polite"
          className={cn(
            'text-[11px] leading-normal font-normal',
            error ? 'text-brand' : success ? 'text-emerald-700' : 'text-muted',
          )}
        >
          {error || success || hint}
        </small>
      )}
    </Container>
  )
}
