import type { ReactNode } from 'react'
import { Icon } from '../actions/Icon'

export function FilterPanel({
  label = '상세 검색',
  activeCount,
  children,
}: {
  label?: string
  activeCount: number
  children: ReactNode
}) {
  return (
    <details className="group/filter mx-6 mb-5">
      <summary className="flex min-h-8 w-fit items-center gap-2 rounded text-xs text-muted hover:text-brand-ink">
        <Icon className="transition-transform group-open/filter:rotate-180" name="down" size={15} />
        <span>{label}</span>
        {activeCount > 0 && (
          <span className="ml-1 rounded bg-brand-soft px-2 py-1 text-[10px] text-brand-ink">
            {activeCount}개 적용 중
          </span>
        )}
      </summary>
      <div className="mt-2 rounded-xl bg-canvas [&_label]:min-w-[150px] [&_label]:flex-1 [&>div]:p-4">
        {children}
      </div>
    </details>
  )
}
