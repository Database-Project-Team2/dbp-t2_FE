import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function FormActions({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <div
      className={cn(
        'mt-6 flex items-center justify-end gap-2.5 border-t border-line pt-6 [&>.text-muted]:mr-auto',
        className,
      )}
      {...props}
    />
  )
}
