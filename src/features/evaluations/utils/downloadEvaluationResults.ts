import { downloadCsv, csvContent } from '@/shared/lib/csv'
import { EVAL_TYPES } from '@/shared/model/labels'
import type { Database } from '@/shared/model/entities'
import type { Evaluation } from '@/shared/model/entities'

export function downloadEvaluationResults(db: Database, results: Evaluation[]) {
  downloadCsv(
    '평가_기초자료.csv',
    csvContent(
      [
        '프로젝트',
        '피평가자',
        '평가유형',
        '실제 평가자',
        '등록자',
        '평가일',
        '업무수행 점수',
        '업무수행 의견',
        '커뮤니케이션 점수',
        '커뮤니케이션 의견',
      ],
      results.map((e) => {
        const target = db.members.find((m) => m.member_id === e.target_member_id)!
        const p = db.projects.find((p) => p.project_id === target.project_id)!
        const evaluator =
          e.evaluation_type === 'CLIENT'
            ? db.clients.find((c) => c.client_id === p.client_id)?.contact_name
            : db.employees.find(
                (x) =>
                  x.employee_id ===
                  db.members.find((m) => m.member_id === e.evaluator_member_id)?.employee_id,
              )?.employee_name
        return [
          p.project_name,
          db.employees.find((x) => x.employee_id === target.employee_id)?.employee_name,
          EVAL_TYPES[e.evaluation_type],
          evaluator,
          db.employees.find(
            (x) =>
              x.employee_id ===
              db.members.find((m) => m.member_id === e.registered_by_member_id)?.employee_id,
          )?.employee_name,
          e.evaluated_date,
          e.work_performance_score,
          e.work_performance_comment,
          e.communication_score,
          e.communication_comment,
        ]
      }),
    ),
  )
}
