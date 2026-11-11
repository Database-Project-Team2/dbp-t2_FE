import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface TabButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean
}
export function TabButton({ active, className, ...props }: TabButtonProps) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        'flex items-center gap-2 border-b-2 px-0.5 pt-5 pb-4 text-[13px] whitespace-nowrap',
        '[&>span]:rounded [&>span]:px-1.5 [&>span]:py-0.5 [&>span]:text-[10px]',
        active
          ? 'border-brand font-semibold text-brand-ink [&>span]:bg-brand-soft'
          : 'border-transparent text-muted [&>span]:bg-canvas',
        className,
      )}
      {...props}
    />
  )
}
