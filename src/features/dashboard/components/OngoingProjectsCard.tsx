import { Badge } from '@/shared/ui/feedback/Badge'
import { Card } from '@/shared/ui/layout/Card'
import { dateLabel } from '@/shared/lib/date'
import { Empty } from '@/shared/ui/feedback/Empty'
import { go } from '@/app/routing/navigation'
import { Icon } from '@/shared/ui/actions/Icon'
import { isAssigned } from '@/shared/domain/assignments'
import { SectionHeading } from '@/shared/ui/layout/SectionHeading'
import { useStore } from '@/store/StoreContext'
import type { Project } from '@/shared/model/entities'

export function OngoingProjectsCard({
  projects: ongoing,
  date,
  historical,
}: {
  projects: Project[]
  date: string
  historical: boolean
}) {
  const { db } = useStore()
  return (
    <Card as="section">
      <SectionHeading>
        <div>
          <h2>
            {historical ? '당시 진행 프로젝트' : '진행 중인 프로젝트'} <span>{ongoing.length}</span>
          </h2>
        </div>
        <a
          className="inline-flex items-center gap-1 text-xs whitespace-nowrap text-muted hover:text-brand-ink"
          href="#/projects"
        >
          전체 보기 <Icon name="arrow" size={14} />
        </a>
      </SectionHeading>
      {ongoing.length ? (
        ongoing.map((p) => {
          const team = db.members.filter(
            (m) => m.project_id === p.project_id && isAssigned(m, date),
          )
          const client = db.clients.find((c) => c.client_id === p.client_id)!
          return (
            <button
              className="block w-full border-t border-line px-7 py-6 text-left transition-colors hover:bg-subtle"
              key={p.project_id}
              onClick={() => go(`projects/${p.project_id}`)}
            >
              <div
                className={cn(
                  'flex items-center gap-3 [&>div]:flex-1 [&>svg]:text-muted',
                  '[&_h3]:mt-1.5 [&_h3]:text-base [&_small]:text-[11px] [&_small]:text-muted',
                )}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-canvas bg-rose-50 text-muted text-rose-700">
                  <Icon name="folder" size={24} />
                </span>
                <div>
                  <small>{client.client_name}</small>
                  <h3>{p.project_name}</h3>
                </div>
                <Icon name="arrow" size={19} />
              </div>
              <div className="mt-5 flex items-center gap-2.5 [&>span:last-child]:text-[11px] [&>span:last-child]:text-muted">
                <Badge tone={p.planned_end_date < date ? 'orange' : 'accent'}>
                  {p.planned_end_date < date ? '예정일 경과' : '진행 중'}
                </Badge>
                <span>
                  {dateLabel(p.actual_start_date)} — {dateLabel(p.planned_end_date)}
                </span>
              </div>
              <div className="mt-5 flex items-center gap-2 text-[11px] text-muted">
                <Icon name="people" size={16} />
                <span>{team.length}명 투입 중</span>
                <span className="ml-auto flex items-center gap-1">
                  상세 보기 <Icon name="arrow" size={14} />
                </span>
              </div>
            </button>
          )
        })
      ) : (
        <Empty
          title="진행 중인 프로젝트가 없어요"
          message="기준일을 바꾸거나 전체 프로젝트를 확인해 보세요."
        />
      )}
    </Card>
  )
}
import { cn } from '@/shared/lib/cn'
