import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { controlStyles } from './controlStyles'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlStyles, 'w-full', className)} {...props} />
}
