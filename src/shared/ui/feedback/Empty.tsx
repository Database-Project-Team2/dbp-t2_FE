import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from '../actions/Icon'

export function Empty({
  title = '검색 결과가 없어요',
  message = '검색 조건을 바꾸고 다시 확인해 주세요.',
  action,
}: {
  title?: string
  message?: string
  action?: ReactNode
}) {
  return (
    <div
      className={cn(
        'px-6 py-12 text-center [&_h3]:text-[15px] [&_h3]:font-medium [&_h3]:text-secondary',
        '[&_p]:mx-auto [&_p]:mt-2 [&_p]:mb-5 [&_p]:max-w-[340px] [&_p]:text-xs [&_p]:text-muted',
      )}
    >
      <span className="mb-4 inline-flex rounded-full bg-canvas p-4 text-muted">
        <Icon name="search" size={26} />
      </span>
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  )
}
