import { downloadCsv } from '@/shared/lib/csv'
import { evaluationCsvContent } from '@/shared/domain/evaluationExport'
import type { Database, Employee, EvaluationResult } from '@/shared/model/entities'

export function downloadEvaluationResults(
  db: Database,
  user: Employee,
  results: EvaluationResult[],
) {
  downloadCsv(
    '평가_기초자료.csv',
    evaluationCsvContent(
      db,
      user,
      results.map((evaluation) => evaluation.evaluation_id),
    ),
  )
}
