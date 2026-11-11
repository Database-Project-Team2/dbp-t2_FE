import { Badge } from '@/shared/ui/feedback/Badge'
import { Button } from '@/shared/ui/actions/Button'
import { cn } from '@/shared/lib/cn'
import { dateLabel } from '@/shared/lib/date'
import { Empty } from '@/shared/ui/feedback/Empty'
import { Icon } from '@/shared/ui/actions/Icon'
import { useStore } from '@/store/StoreContext'
import type { Project } from '@/shared/model/entities'

export function EvaluationProjects({
  projects,
  canRead,
  onWrite,
}: {
  projects: Project[]
  canRead: boolean
  onWrite: (project: Project) => void
}) {
  const { db, user } = useStore()
  const me = user!
  return (
    <div
      className={cn(
        'px-6 [&_h3]:text-[15px] [&_p]:mt-2 [&_p]:mb-3 [&_p]:text-[11px] [&_p]:text-muted',
        '[&>article]:flex [&>article]:items-center [&>article]:gap-5 [&>article]:border-b',
        '[&>article]:border-line [&>article]:py-6 [&>article:last-child]:border-b-0',
        '[&>article>div]:flex-1',
      )}
    >
      {projects.map((p) => {
        const own = db.members.find(
          (m) => m.project_id === p.project_id && m.employee_id === me.employee_id,
        )!
        const count = db.evaluations.filter(
          (e) => e.registered_by_member_id === own.member_id,
        ).length
        return (
          <article key={p.project_id}>
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-canvas text-muted">
              <Icon name="folder" size={24} />
            </span>
            <div>
              <h3>{p.project_name}</h3>
              <p>
                종료일 {dateLabel(p.actual_end_date)} · {count}건 작성·등록
              </p>
              <div className="flex gap-1.5">
                <Badge tone="purple">동료평가</Badge>
                {own.project_role === 'PM' && (
                  <>
                    <Badge tone="accent">PM 평가</Badge>
                    <Badge tone="green">고객평가 등록</Badge>
                  </>
                )}
              </div>
            </div>
            <Button variant="secondary" onClick={() => onWrite(p)}>
              평가 작성 <Icon name="arrow" size={16} />
            </Button>
          </article>
        )
      })}
      {!projects.length && (
        <Empty
          title="아직 평가할 프로젝트가 없어요"
          message="참여한 프로젝트가 종료되면 이곳에서 평가할 수 있어요."
        />
      )}
      {!canRead && (
        <div className="my-5 flex items-center gap-2 rounded-xl bg-canvas px-4 py-3.5 text-xs leading-relaxed text-secondary">
          <Icon name="shield" size={18} />
          일반 직원은 동료평가를 작성할 수 있고, 평가 결과 검색은 경영진·PM에게 제공돼요.
        </div>
      )}
    </div>
  )
}
