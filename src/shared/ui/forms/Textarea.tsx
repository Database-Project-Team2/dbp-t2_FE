import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { useFieldControl } from './FieldContext'
import { controlStyles } from './controlStyles'

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const control = useFieldControl(props)
  return (
    <textarea
      className={cn(controlStyles, 'w-full resize-y leading-relaxed', className)}
      {...props}
      {...control}
    />
  )
}
