import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from '../actions/Icon'
import { Input } from './Input'

interface SearchFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string
}
export function SearchField({ containerClassName, className, ...props }: SearchFieldProps) {
  return (
    <div
      className={cn(
        'flex min-h-[42px] items-center gap-2 rounded-[10px] border border-line bg-white px-3 text-muted',
        'focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/10',
        containerClassName,
      )}
    >
      <Icon name="search" size={18} />
      <Input className={cn('border-0 bg-transparent px-0 focus:ring-0', className)} {...props} />
    </div>
  )
}
