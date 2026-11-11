import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { controlStyles } from './controlStyles'

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(controlStyles, 'min-h-[42px]', className)} {...props} />
}
