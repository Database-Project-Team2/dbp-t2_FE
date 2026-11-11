import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function SectionHeading({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-7 pt-6 pb-5 [&_h2]:text-[17px] [&_h2>span]:ml-1.5',
        '[&_h2>span]:text-[13px] [&_h2>span]:font-medium [&_h2>span]:text-brand-ink [&_p]:mt-2',
        '[&_p]:text-xs [&_p]:text-muted',
        className,
      )}
      {...props}
    />
  )
}
