import type { HTMLAttributes } from 'react'
import { Card } from '@/shared/ui/layout/Card'
import { cn } from '@/shared/lib/cn'

export function GuideSection({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <Card
      as="section"
      className={cn(
        'p-7 [&_h2]:mb-5 [&_h2]:text-[17px] [&_p]:text-xs [&_p]:leading-loose [&_p]:text-secondary',
        '[&_li]:py-1 [&_li]:text-xs [&_li]:leading-loose [&_li]:text-secondary [&_ul]:list-disc',
        '[&_p+p]:mt-3 [&_table]:mt-5 [&_td]:whitespace-normal [&_th]:whitespace-normal [&_ul]:pl-5',
        className,
      )}
      {...props}
    />
  )
}
