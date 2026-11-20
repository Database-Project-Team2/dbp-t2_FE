import { useState } from 'react'
import { evaluationsApi, projectsApi } from '@/shared/api/resources'
import { useApi } from '@/shared/api/useApi'
import { completeDate } from '@/shared/lib/date'

/** 검색 조건을 서버 조회 조건으로 바꿉니다. 행 범위와 의견 공개는 서버가 정합니다. */
export function useEvaluationSearch() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const [project, setProject] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const filters = {
    target_employee_name: query,
    project_id: project,
    evaluation_type: type,
    from: completeDate(from),
    to: completeDate(to),
  }
  const eligible = useApi(() => evaluationsApi.eligible(), [])
  const results = useApi(() => evaluationsApi.search(filters), [filters])
  const total = useApi(() => evaluationsApi.search({ size: 1 }), [results.data?.meta.request_id])
  const resultProjects = useApi(() => projectsApi.list(), []).data?.data ?? []
  return {
    query,
    setQuery,
    type,
    setType,
    project,
    setProject,
    from,
    setFrom,
    to,
    setTo,
    filters,
    mine: eligible.data ?? [],
    reloadMine: eligible.reload,
    reloadResults: results.reload,
    total: total.data?.page.total_elements ?? 0,
    results: results.data?.data ?? [],
    resultsLoaded: !!results.data,
    resultsError: results.error,
    resultProjects,
  }
}
export type EvaluationSearch = ReturnType<typeof useEvaluationSearch>
