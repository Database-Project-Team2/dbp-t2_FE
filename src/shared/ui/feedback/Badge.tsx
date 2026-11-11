import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

const tones: Record<string, string> = {
  gray: 'bg-canvas text-secondary',
  accent: 'bg-brand-soft text-brand-ink',
  green: 'bg-success-soft text-success',
  orange: 'bg-warning-soft text-warning',
  purple: 'bg-purple-soft text-purple',
}
export function Badge({ children, tone = 'gray' }: { children: ReactNode; tone?: string }) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1 rounded-md px-2 py-1 text-[11px] leading-normal font-semibold whitespace-nowrap',
        tones[tone] ?? tones.gray,
      )}
    >
      {children}
    </span>
  )
}
