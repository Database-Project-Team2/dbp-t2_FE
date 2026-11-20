import { Avatar } from '@/shared/ui/data/Avatar'
import { cn } from '@/shared/lib/cn'
import { dateLabel } from '@/shared/lib/date'
import { EVAL_TYPES } from '@/shared/model/labels'
import { InfoGrid } from '@/shared/ui/data/InfoGrid'
import { Modal } from '@/shared/ui/overlays/Modal'
import type { EvaluationView } from '@/shared/api/types'

export function EvaluationDetailDialog({
  evaluation: e,
  onClose,
}: {
  evaluation: EvaluationView
  onClose: () => void
}) {
  // 의견은 서버가 권한 있는 사용자에게만 보냅니다.
  if (!e.comments_visible) return null
  const employee = e.target
  const registered = e.registered_by
  const evaluator = e.evaluator.name
  return (
    <Modal title="평가 상세" subtitle={e.project_name} onClose={onClose}>
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
