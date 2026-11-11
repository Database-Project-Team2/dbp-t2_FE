import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function PersonInline({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 [&_b]:text-xs [&_b]:font-medium [&_b]:text-secondary [&_small]:mt-1',
        '[&_small]:block [&_small]:text-[10px] [&_small]:text-muted',
        className,
      )}
      {...props}
    />
  )
}
