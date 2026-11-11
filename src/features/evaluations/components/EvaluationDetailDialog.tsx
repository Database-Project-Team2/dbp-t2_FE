import { Avatar } from '@/shared/ui/data/Avatar'
import { cn } from '@/shared/lib/cn'
import { dateLabel } from '@/shared/lib/date'
import { EVAL_TYPES } from '@/shared/model/labels'
import { InfoGrid } from '@/shared/ui/data/InfoGrid'
import { Modal } from '@/shared/ui/overlays/Modal'
import { useStore } from '@/store/StoreContext'
import type { Evaluation } from '@/shared/model/entities'

export function EvaluationDetailDialog({
  evaluation: e,
  onClose,
}: {
  evaluation: Evaluation
  onClose: () => void
}) {
  const { db } = useStore()
  const target = db.members.find((m) => m.member_id === e.target_member_id)!
  const p = db.projects.find((p) => p.project_id === target.project_id)!
  const employee = db.employees.find((x) => x.employee_id === target.employee_id)!
  const registered = db.employees.find(
    (x) =>
      x.employee_id ===
      db.members.find((m) => m.member_id === e.registered_by_member_id)?.employee_id,
  )!
  const evaluator =
    e.evaluation_type === 'CLIENT'
      ? db.clients.find((c) => c.client_id === p.client_id)?.contact_name
      : db.employees.find(
          (x) =>
            x.employee_id ===
            db.members.find((m) => m.member_id === e.evaluator_member_id)?.employee_id,
        )?.employee_name
  return (
    <Modal title="평가 상세" subtitle={p.project_name} onClose={onClose}>
      <div
        className={cn(
          'mt-1 mb-6 flex items-center gap-4 [&_h2]:flex [&_h2]:items-center [&_h2]:gap-2.5',
          '[&_h2]:text-2xl [&_p]:mt-2 [&_p]:text-xs [&_p]:text-muted [&>span]:size-16',
          '[&>span]:rounded-3xl [&>span]:text-lg',
        )}
      >
        <Avatar name={employee.employee_name} id={employee.employee_id} />
        <div>
          <h2>{employee.employee_name}</h2>
          <p>
            {EVAL_TYPES[e.evaluation_type]} · {dateLabel(e.evaluated_date)}
          </p>
        </div>
      </div>
      <InfoGrid>
        <div>
          <dt>실제 평가자{e.evaluation_type === 'CLIENT' ? ' (현재 담당자)' : ''}</dt>
          <dd>{evaluator}</dd>
        </div>
        <div>
          <dt>시스템 등록자</dt>
          <dd>{registered.employee_name}</dd>
        </div>
      </InfoGrid>
      {[
        ['업무수행', e.work_performance_score, e.work_performance_comment],
        ['커뮤니케이션', e.communication_score, e.communication_comment],
      ].map(([label, score, comment]) => (
        <div
          className={cn(
            'mt-5 rounded-xl border border-line p-5 [&_b]:text-[22px] [&_b]:text-brand-ink',
            '[&_h3]:text-[13px] [&_p]:mt-4 [&_p]:text-xs [&_p]:whitespace-pre-wrap',
            '[&_p]:text-secondary [&_small]:text-[11px] [&_small]:font-normal [&_small]:text-muted',
            '[&>div]:flex [&>div]:items-center [&>div]:justify-between',
          )}
          key={label}
        >
          <div>
            <h3>{label}</h3>
            <b>
              {score}
              <small> / 5점</small>
            </b>
          </div>
          <p>{comment}</p>
        </div>
      ))}
    </Modal>
  )
}
