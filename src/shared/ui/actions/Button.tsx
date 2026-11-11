import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const variants = {
  primary: 'bg-brand text-white shadow-sm hover:bg-brand-hover',
  secondary:
    'border border-line bg-white text-secondary hover:border-brand-line hover:bg-brand-soft',
  text: 'text-brand-ink hover:text-brand-hover',
  icon: 'text-muted hover:bg-brand-soft hover:text-brand-ink',
  link: 'text-secondary hover:text-brand-ink',
}
const sizes = {
  default: 'rounded-xl px-4 py-3 text-[13px]',
  small: 'rounded-lg px-3 py-2 text-xs',
  plain: 'p-0 text-xs',
  icon: 'rounded-lg p-2',
}
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}
export function Button({
  variant = 'primary',
  size = 'default',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap transition-colors',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}
