import { Badge } from '@/shared/ui/feedback/Badge'
import { Button } from '@/shared/ui/actions/Button'
import { Card } from '@/shared/ui/layout/Card'
import { clientCoverage, workflowLabel } from '@/shared/domain/evaluations'
import { cn } from '@/shared/lib/cn'
import { dateLabel } from '@/shared/lib/date'
import { SectionHeading } from '@/shared/ui/layout/SectionHeading'
import { useStore } from '@/store/StoreContext'
import type { Project } from '@/shared/model/entities'

export function CustomerEvaluationCard({
  project: p,
  canRecord,
  onRecord,
}: {
  project: Project
  canRecord: boolean
  onRecord: () => void
}) {
  const { db } = useStore()
  const coverage = clientCoverage(db, p)
  return (
    <Card as="section">
      <SectionHeading>
        <div>
          <h2>고객평가 진행 상황</h2>
          <p>의뢰부터 회사 보고까지 단계별로 기록해요.</p>
        </div>
        <Badge tone={p.evaluation_reported_date ? 'green' : 'orange'}>{workflowLabel(p)}</Badge>
      </SectionHeading>
      <div className="flex px-6 pt-4 pb-7">
        {[
          ['의뢰', p.evaluation_requested_date],
          ['전체 회수', p.evaluation_received_date],
          ['회사 보고', p.evaluation_reported_date],
        ].map(([label, value], i) => (
          <div
            key={label}
            data-complete={Boolean(value)}
            className={cn(
              'group/step relative flex flex-1 flex-col items-center text-xs before:absolute',
              'before:top-4 before:-left-1/2 before:h-0.5 before:w-full before:bg-line',
              'first:before:hidden',
            )}
          >
            <span
              className={cn(
                'relative z-10 grid size-9 place-items-center rounded-full border-4 border-white bg-canvas',
                'text-[11px] text-muted group-data-[complete=true]/step:bg-brand',
                'group-data-[complete=true]/step:text-white',
              )}
            >
              {value ? '✓' : i + 1}
            </span>
            <b className="mt-2 text-[11px] font-medium text-secondary group-data-[complete=true]/step:text-brand-ink">
              {label}
            </b>
            <small className="mt-2 text-[10px] text-muted">{dateLabel(value)}</small>
          </div>
        ))}
      </div>
      <div
        className={cn(
          'mx-6 mb-5 flex items-center justify-between gap-4 rounded-xl bg-canvas p-4 [&_b]:text-xs',
          '[&_b]:font-medium [&_p]:mt-1 [&_p]:max-w-[260px] [&_p]:text-[11px] [&_p]:text-muted',
        )}
      >
        <div>
          <b>
            고객평가 {coverage.received} / {coverage.total}명
          </b>
          <p>실제 투입된 구성원의 평가를 모두 등록하면 회수 완료할 수 있어요.</p>
        </div>
        {canRecord && p.actual_end_date && !p.evaluation_reported_date && (
          <Button variant="primary" onClick={onRecord}>
            {!p.evaluation_requested_date
              ? '의뢰일 기록'
              : !p.evaluation_received_date
                ? '전체 회수 완료'
                : '회사 보고 완료'}
          </Button>
        )}
      </div>
      <div className="border-t border-line px-6 py-3.5 text-[11px] text-muted">
        의뢰·보고는 상태 기록 기능이며, 이메일을 발송하지 않아요.
      </div>
    </Card>
  )
}
