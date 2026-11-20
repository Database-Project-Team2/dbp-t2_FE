import { downloadBlob } from '@/shared/lib/csv'
import { evaluationsApi } from '@/shared/api/resources'
import type { Query } from '@/shared/api/client'

/** 현재 검색 조건의 전체 결과를 서버 CSV로 받습니다. 행·의견 권한은 서버가 적용합니다. */
export async function downloadEvaluationResults(filters: Query) {
  const file = await evaluationsApi.exportCsv(filters)
  downloadBlob(file.filename, file.blob)
}
