import { ROLES } from '@/shared/model/labels'
import { Badge } from '@/shared/ui/feedback/Badge'
import { Card } from '@/shared/ui/layout/Card'
import { dateLabel } from '@/shared/lib/date'
import { Empty } from '@/shared/ui/feedback/Empty'
import { go } from '@/app/routing/navigation'
import { Icon } from '@/shared/ui/actions/Icon'
import { SectionHeading } from '@/shared/ui/layout/SectionHeading'
import type { ProjectRole } from '@/shared/model/entities'

interface OngoingProject {
  project_id: number
  project_name: string
  client_name: string
  actual_start_date: string
  planned_end_date: string
  current_member_count: number
  overdue: boolean
  my_role?: ProjectRole
  my_assignment_start_date?: string | null
}

export function OngoingProjectsCard({
  projects: ongoing,
  historical,
  personal = false,
}: {
  projects: OngoingProject[]
  historical: boolean
  personal?: boolean
}) {
  return (
    <Card as="section">
      <SectionHeading>
        <div>
          <h2>
            {personal
              ? '내 참여·예정 프로젝트'
              : historical
                ? '당시 진행 프로젝트'
                : '진행 중인 프로젝트'}{' '}
            <span>{ongoing.length}</span>
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
                  <small>{p.client_name}</small>
                  <h3>{p.project_name}</h3>
                  {personal && p.my_role && (
                    <p className="mt-2 text-xs text-secondary">
                      내 역할 · {ROLES[p.my_role]}
                      {!p.my_assignment_start_date && ' · 투입 전'}
                    </p>
                  )}
                </div>
                <Icon name="arrow" size={19} />
              </div>
              <div className="mt-5 flex items-center gap-2.5 [&>span:last-child]:text-[11px] [&>span:last-child]:text-muted">
                <Badge tone={p.overdue ? 'orange' : 'accent'}>
                  {p.overdue ? '예정일 경과' : '진행 중'}
                </Badge>
                <span>
                  {dateLabel(p.actual_start_date)} — {dateLabel(p.planned_end_date)}
                </span>
              </div>
              <div className="mt-5 flex items-center gap-2 text-[11px] text-muted">
                <Icon name="people" size={16} />
                <span>{p.current_member_count}명 투입 중</span>
                <span className="ml-auto flex items-center gap-1">
                  상세 보기 <Icon name="arrow" size={14} />
                </span>
              </div>
            </button>
          )
        })
      ) : (
        <Empty
          title={personal ? '현재 참여 중인 프로젝트가 없어요' : '진행 중인 프로젝트가 없어요'}
          message={
            personal
              ? '프로젝트에 배정되면 이곳에서 일정과 역할을 확인할 수 있어요.'
              : '기준일을 바꾸거나 전체 프로젝트를 확인해 보세요.'
          }
        />
      )}
    </Card>
  )
}
import { cn } from '@/shared/lib/cn'
