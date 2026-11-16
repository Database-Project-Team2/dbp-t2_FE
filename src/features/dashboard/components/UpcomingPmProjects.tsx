import { Badge } from '@/shared/ui/feedback/Badge'
import { Icon } from '@/shared/ui/actions/Icon'
import { dateLabel } from '@/shared/lib/date'
import { go } from '@/app/routing/navigation'
import { useStore } from '@/store/StoreContext'
import { upcomingPmProjects } from '../model/dashboardOverview'

export function UpcomingPmProjects() {
  const { db, user, today } = useStore()
  const upcoming = upcomingPmProjects(db, user!, today)
  return (
    <section className="mb-6 rounded-[18px] border border-brand-line bg-white p-7">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand-ink">
          <Icon name="clock" />
        </span>
        <div>
          <p className="mb-1 text-xs font-medium text-brand-ink">PM 담당 프로젝트</p>
          <h2 className="text-lg font-bold">
            7일 안에 종료 예정이에요 <span className="ml-1 text-brand-ink">{upcoming.length}</span>
          </h2>
        </div>
        <span className="ml-auto text-xs text-muted">오늘부터 D-7까지 · 예정 종료일 기준</span>
      </div>
      {upcoming.length ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {upcoming.map(({ project, days }) => (
            <button
              key={project.project_id}
              onClick={() => go(`projects/${project.project_id}`)}
              className="flex items-center gap-4 rounded-xl bg-canvas p-4 text-left hover:bg-brand-soft"
            >
              <Badge tone="accent">{days === 0 ? 'D-Day' : `D-${days}`}</Badge>
              <span className="min-w-0 flex-1">
                <b className="block truncate text-sm">{project.project_name}</b>
                <span className="mt-1.5 block text-xs text-secondary">
                  종료 예정 {dateLabel(project.planned_end_date)}
                </span>
              </span>
              <Icon name="arrow" size={16} className="text-muted" />
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-xl bg-canvas px-4 py-4 text-sm text-secondary">
          7일 이내 종료 예정인 담당 프로젝트가 없어요.
        </p>
      )}
    </section>
  )
}
