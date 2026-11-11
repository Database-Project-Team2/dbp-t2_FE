import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function InfoGrid({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <dl
      className={cn(
        'm-0 grid grid-cols-2 gap-6 border-y border-line py-6 [&_dt]:mb-2 [&_dt]:text-[11px]',
        '[&_dd]:m-0 [&_dd]:text-[13px] [&_dd]:text-secondary [&_dt]:text-muted',
        className,
      )}
      {...props}
    />
  )
}
