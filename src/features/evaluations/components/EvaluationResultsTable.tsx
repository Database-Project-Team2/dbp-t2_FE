import { Avatar } from '@/shared/ui/data/Avatar'
import { Badge } from '@/shared/ui/feedback/Badge'
import { Button } from '@/shared/ui/actions/Button'
import { dateLabel } from '@/shared/lib/date'
import { Empty } from '@/shared/ui/feedback/Empty'
import { EVAL_TYPES } from '@/shared/model/labels'
import { PersonInline } from '@/shared/ui/data/PersonInline'
import { Table } from '@/shared/ui/data/Table'
import { useStore } from '@/store/StoreContext'
import type { Evaluation } from '@/shared/model/entities'

export function EvaluationResultsTable({
  results,
  onSelect,
}: {
  results: Evaluation[]
  onSelect: (evaluation: Evaluation) => void
}) {
  const { db } = useStore()
  return (
    <div className="overflow-auto">
      <Table>
        <thead>
          <tr>
            <th>평가받은 직원</th>
            <th>프로젝트</th>
            <th>평가유형</th>
            <th>업무수행</th>
            <th>커뮤니케이션</th>
            <th>평가일</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {[...results]
            .sort(
              (a, b) =>
                b.evaluated_date.localeCompare(a.evaluated_date) ||
                b.evaluation_id - a.evaluation_id,
            )
            .map((e) => {
              const target = db.members.find((m) => m.member_id === e.target_member_id)!
              const employee = db.employees.find((x) => x.employee_id === target.employee_id)!
              return (
                <tr key={e.evaluation_id}>
                  <td>
                    <PersonInline>
                      <Avatar name={employee.employee_name} id={employee.employee_id} small />
                      <b>{employee.employee_name}</b>
                    </PersonInline>
                  </td>
                  <td>
                    {db.projects.find((p) => p.project_id === target.project_id)?.project_name}
                  </td>
                  <td>
                    <Badge
                      tone={
                        e.evaluation_type === 'CLIENT'
                          ? 'green'
                          : e.evaluation_type === 'PM'
                            ? 'accent'
                            : 'purple'
                      }
                    >
                      {EVAL_TYPES[e.evaluation_type]}
                    </Badge>
                  </td>
                  <td>
                    <span className="text-[13px] font-bold text-brand-ink">
                      {e.work_performance_score}
                    </span>
                    <span className="text-xs text-muted"> / 5</span>
                  </td>
                  <td>
                    <span className="text-[13px] font-bold text-brand-ink">
                      {e.communication_score}
                    </span>
                    <span className="text-xs text-muted"> / 5</span>
                  </td>
                  <td>{dateLabel(e.evaluated_date)}</td>
                  <td>
                    <Button variant="link" size="plain" onClick={() => onSelect(e)}>
                      의견 보기
                    </Button>
                  </td>
                </tr>
              )
            })}
        </tbody>
      </Table>
      {!results.length && <Empty />}
    </div>
  )
}
