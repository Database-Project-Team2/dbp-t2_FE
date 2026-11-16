import { go } from '@/app/routing/navigation'
import { pendingEvaluationTasks } from '@/shared/domain/evaluationTasks'
import { workflowLabel } from '@/shared/domain/evaluations'
import { isPM } from '@/shared/domain/permissions'
import { Button } from '@/shared/ui/actions/Button'
import { Icon } from '@/shared/ui/actions/Icon'
import { Empty } from '@/shared/ui/feedback/Empty'
import { Card } from '@/shared/ui/layout/Card'
import { SectionHeading } from '@/shared/ui/layout/SectionHeading'
import { useStore } from '@/store/StoreContext'

export function PersonalTasksCard() {
  const { db, user } = useStore()
  const tasks = pendingEvaluationTasks(db, user!)
  const workflows = db.projects.filter(
    (project) =>
      project.actual_end_date &&
      !project.evaluation_reported_date &&
      isPM(db, user!, project.project_id),
  )
  return (
    <Card as="section">
      <SectionHeading>
        <h2>
          내가 할 일 <span>{tasks.length + workflows.length}</span>
        </h2>
      </SectionHeading>
      <div className="divide-y divide-line px-7">
        {tasks.map(({ project, count }) => (
          <div key={project.project_id} className="flex items-center gap-4 py-5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-ink">
              <Icon name="check" />
            </span>
            <div className="flex-1">
              <b className="text-sm">남은 평가 {count}건</b>
              <p className="mt-1.5 text-xs text-muted">{project.project_name}</p>
            </div>
            <Button variant="text" size="plain" onClick={() => go('evaluations/write')}>
              평가하기 <Icon name="arrow" size={15} />
            </Button>
          </div>
        ))}
        {workflows.map((project) => (
          <div key={`workflow-${project.project_id}`} className="flex items-center gap-4 py-5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-canvas text-secondary">
              <Icon name="clock" />
            </span>
            <div className="flex-1">
              <b className="text-sm">고객평가 {workflowLabel(project)}</b>
              <p className="mt-1.5 text-xs text-muted">{project.project_name} · PM 담당</p>
            </div>
            <Button
              variant="text"
              size="plain"
              onClick={() => go(`projects/${project.project_id}`)}
            >
              확인하기 <Icon name="arrow" size={15} />
            </Button>
          </div>
        ))}
      </div>
      {!tasks.length && !workflows.length && (
        <Empty
          title="지금은 할 일을 모두 마쳤어요"
          message="참여한 프로젝트가 종료되면 평가할 일이 여기에 표시돼요."
        />
      )}
    </Card>
  )
}
