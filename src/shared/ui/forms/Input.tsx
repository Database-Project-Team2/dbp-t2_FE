import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { useFieldControl } from './FieldContext'
import { controlStyles } from './controlStyles'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const control = useFieldControl(props)
  return <input className={cn(controlStyles, 'w-full', className)} {...props} {...control} />
}
