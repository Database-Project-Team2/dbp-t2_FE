import { Card } from '@/shared/ui/layout/Card'
import { cn } from '@/shared/lib/cn'
import { dateLabel } from '@/shared/lib/date'
import { Empty } from '@/shared/ui/feedback/Empty'
import { go } from '@/app/routing/navigation'
import { Icon } from '@/shared/ui/actions/Icon'
import { SectionHeading } from '@/shared/ui/layout/SectionHeading'
import { useStore } from '@/store/StoreContext'
import { workflowLabel, clientCoverage } from '@/shared/domain/evaluations'
import type { Project } from '@/shared/model/entities'

export function PendingTasksCard({ pending, overdue }: { pending: Project[]; overdue: Project[] }) {
  const { db } = useStore()
  return (
    <Card as="section" className="flex flex-col">
      <SectionHeading>
        <div>
          <h2>
            확인이 필요해요{' '}
            <span className="rounded bg-warning-soft px-1.5 py-0.5 text-[10px] text-warning">
              {pending.length + overdue.length}
            </span>
          </h2>
        </div>
      </SectionHeading>
      <div
        className={cn(
          'flex-1 px-7 pb-2 [&_b]:text-[13px] [&_b]:font-semibold [&_button:hover_b]:text-brand-ink',
          '[&_p]:mt-1 [&_p]:text-[11px] [&_p]:text-muted [&_small]:mt-1 [&_small]:block',
          '[&_small]:text-[10px] [&_small]:text-muted [&>button]:flex [&>button]:w-full',
          '[&>button]:items-start [&>button]:gap-3 [&>button]:border-b [&>button]:border-line',
          '[&>button]:py-5 [&>button]:text-left [&>button:first-child]:border-t',
          '[&>button:last-child]:border-b-0 [&>button>div]:flex-1 [&>button>svg]:mt-2',
          '[&>button>svg]:text-muted',
        )}
      >
        {overdue.map((p) => (
          <button key={`o${p.project_id}`} onClick={() => go(`projects/${p.project_id}`)}>
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-warning-soft text-warning">
              <Icon name="clock" />
            </span>
            <div>
              <b>프로젝트 일정을 확인해 주세요</b>
              <p>{p.project_name}</p>
              <small>종료 예정 {dateLabel(p.planned_end_date)}</small>
            </div>
            <Icon name="arrow" size={16} />
          </button>
        ))}
        {pending.map((p) => (
          <button key={p.project_id} onClick={() => go(`projects/${p.project_id}`)}>
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-ink">
              <Icon name="check" />
            </span>
            <div>
              <b>고객평가 {workflowLabel(p)}</b>
              <p>{p.project_name}</p>
              <small>
                {clientCoverage(db, p).received}/{clientCoverage(db, p).total}명 등록
              </small>
            </div>
            <Icon name="arrow" size={16} />
          </button>
        ))}
        {!pending.length && !overdue.length && (
          <Empty title="확인할 업무가 없어요" message="새로운 할 일이 생기면 여기에 표시돼요." />
        )}
      </div>
    </Card>
  )
}
