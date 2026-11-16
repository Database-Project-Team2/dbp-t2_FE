import { csvContent } from '../lib/csv.ts'
import { EVAL_TYPES } from '../model/labels.ts'
import type { Database, Employee } from '../model/entities.ts'
import { canReadEvaluationComments, visibleEvaluations } from './permissions.ts'

export function evaluationCsvContent(db: Database, user: Employee, ids: number[]) {
  const requestedIds = new Set(ids)
  const results = visibleEvaluations(db, user).filter((evaluation) =>
    requestedIds.has(evaluation.evaluation_id),
  )
  const withComments = results.some((evaluation) => canReadEvaluationComments(db, user, evaluation))
  const employeeName = (memberId: number | null) =>
    db.employees.find(
      (employee) =>
        employee.employee_id ===
        db.members.find((member) => member.member_id === memberId)?.employee_id,
    )?.employee_name
  return csvContent(
    [
      '프로젝트',
      '피평가자',
      '평가유형',
      '실제 평가자',
      '등록자',
      '평가일',
      '업무수행 점수',
      '커뮤니케이션 점수',
      ...(withComments ? ['업무수행 의견', '커뮤니케이션 의견'] : []),
    ],
    results.map((evaluation) => {
      const target = db.members.find((member) => member.member_id === evaluation.target_member_id)!
      const project = db.projects.find((project) => project.project_id === target.project_id)!
      return [
        project.project_name,
        employeeName(target.member_id),
        EVAL_TYPES[evaluation.evaluation_type],
        evaluation.evaluation_type === 'CLIENT'
          ? db.clients.find((client) => client.client_id === project.client_id)?.contact_name
          : employeeName(evaluation.evaluator_member_id),
        employeeName(evaluation.registered_by_member_id),
        evaluation.evaluated_date,
        evaluation.work_performance_score,
        evaluation.communication_score,
        ...(withComments
          ? [evaluation.work_performance_comment || '', evaluation.communication_comment || '']
          : []),
      ]
    }),
  )
}
