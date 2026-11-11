import { Badge } from '@/shared/ui/feedback/Badge'
import { cn } from '@/shared/lib/cn'
import { dateLabel } from '@/shared/lib/date'
import { go } from '@/app/routing/navigation'
import { Icon } from '@/shared/ui/actions/Icon'
import { isAssigned } from '@/shared/domain/assignments'
import { projectStatus } from '@/shared/domain/projects'
import { useStore } from '@/store/StoreContext'
import { workflowLabel } from '@/shared/domain/evaluations'
import type { Project } from '@/shared/model/entities'

export function ProjectGrid({ projects }: { projects: Project[] }) {
  const { db, today } = useStore()
  return (
    <div className="grid grid-cols-2 gap-5 px-6 pb-6">
      {projects.map((p) => {
        const team = db.members.filter((m) => m.project_id === p.project_id)
        const current = team.filter((m) => isAssigned(m, today))
        return (
          <button
            className={cn(
              'block rounded-xl border border-line px-6 py-5 text-left transition hover:-translate-y-0.5',
              'hover:border-brand-line hover:shadow-card [&>h3]:my-3 [&>h3]:text-[17px]',
            )}
            key={p.project_id}
            onClick={() => go(`projects/${p.project_id}`)}
          >
            <div className="mb-3 flex items-center justify-between gap-4">
              <small className="text-xs text-muted">
                PRJ-{String(p.project_id).padStart(3, '0')} ·{' '}
                {db.clients.find((c) => c.client_id === p.client_id)?.client_name}
              </small>
              <Badge tone={p.actual_end_date ? 'gray' : 'accent'}>{projectStatus(p)}</Badge>
            </div>
            <h3>{p.project_name}</h3>
            <div className="flex items-center gap-2 text-xs text-muted">
              <Icon name="calendar" size={16} />
              {dateLabel(p.actual_start_date)} —{' '}
              {dateLabel(p.actual_end_date || p.planned_end_date)}
            </div>
            <div className="mt-3 min-h-5 text-xs text-muted">
              {!p.actual_end_date && p.planned_end_date < today ? (
                <Badge tone="orange">예정 종료일 경과</Badge>
              ) : p.actual_end_date ? (
                <span>고객평가 · {workflowLabel(p)}</span>
              ) : (
                <span>프로젝트 진행 중</span>
              )}
            </div>
            <div className="mt-4 flex items-center gap-2.5 border-t border-line pt-3 text-xs text-muted [&>svg]:ml-auto">
              <span>
                {p.actual_end_date ? `${team.length}명 참여` : `${current.length}명 투입 중`}
              </span>
              <Icon name="arrow" size={17} />
            </div>
          </button>
        )
      })}
    </div>
  )
}
