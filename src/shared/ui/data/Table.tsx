import type { TableHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

/** 표 전체의 간격·행 구분·호버 규칙을 공유합니다. 열과 데이터는 업무 컴포넌트가 만듭니다. */
export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn(
        'w-full border-collapse text-left text-xs whitespace-nowrap',
        '[&_th]:border-y [&_th]:border-line [&_th]:bg-subtle [&_th]:px-5 [&_th]:py-3 [&_th]:text-[11px] [&_th]:font-medium [&_th]:text-muted',
        '[&_td]:border-b [&_td]:border-line [&_td]:px-5 [&_td]:py-[18px] [&_td]:text-secondary',
        '[&_tbody_tr]:transition-colors [&_tbody_tr]:hover:bg-brand-soft/50 [&_tr:last-child_td]:border-b-0',
        className,
      )}
      {...props}
    />
  )
}
