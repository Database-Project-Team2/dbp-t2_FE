import { Card } from '@/shared/ui/layout/Card'
import { cn } from '@/shared/lib/cn'
import { dateLabel } from '@/shared/lib/date'
import type { Project } from '@/shared/model/entities'

export function ProjectSummary({
  project: p,
  memberCount,
}: {
  project: Project
  memberCount: number
}) {
  return (
    <Card
      className={cn(
        'grid grid-cols-4 py-7 [&_small]:ml-1 [&_small]:text-[13px] [&_small]:text-muted',
        '[&_span]:block [&_span]:text-[11px] [&_span]:text-muted [&_strong]:mt-3 [&_strong]:block',
        '[&_strong]:text-lg [&_strong]:font-semibold [&>div]:border-r [&>div]:border-line',
        '[&>div]:px-6 [&>div:last-child]:border-0',
      )}
    >
      <div>
        <span>실제 착수일</span>
        <strong>{dateLabel(p.actual_start_date)}</strong>
      </div>
      <div>
        <span>예정 종료일</span>
        <strong>{dateLabel(p.planned_end_date)}</strong>
      </div>
      <div>
        <span>실제 종료일</span>
        <strong>{p.actual_end_date ? dateLabel(p.actual_end_date) : '진행 중'}</strong>
      </div>
      <div>
        <span>프로젝트 구성원</span>
        <strong>
          {memberCount}
          <small>명</small>
        </strong>
      </div>
    </Card>
  )
}
