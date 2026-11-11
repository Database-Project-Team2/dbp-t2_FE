import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { controlStyles } from './controlStyles'

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(controlStyles, 'w-full resize-y leading-relaxed', className)}
      {...props}
    />
  )
}
