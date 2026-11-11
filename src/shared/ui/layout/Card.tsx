import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article'
}
export function Card({ as: Tag = 'div', className, ...props }: CardProps) {
  return (
    <Tag
      className={cn(
        'mb-6 overflow-hidden rounded-[18px] border border-line bg-white shadow-card',
        className,
      )}
      {...props}
    />
  )
}
