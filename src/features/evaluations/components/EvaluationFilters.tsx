import { Button } from '@/shared/ui/actions/Button'
import { EVAL_TYPES } from '@/shared/model/labels'
import { FilterPanel } from '@/shared/ui/forms/FilterPanel'
import { Input } from '@/shared/ui/forms/Input'
import { SearchField } from '@/shared/ui/forms/SearchField'
import { Select } from '@/shared/ui/forms/Select'
import type { EvaluationSearch } from '../hooks/useEvaluationSearch'

export function EvaluationFilters({ search }: { search: EvaluationSearch }) {
  const {
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
    resultProjects,
  } = search
  return (
    <>
      {' '}
      <div className="flex flex-wrap items-end gap-3 px-6 pt-6 pb-4">
        <SearchField
          containerClassName="min-w-[200px] flex-1"
          aria-label="피평가 직원 검색"
          placeholder="평가받은 직원 이름"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select
          aria-label="평가 프로젝트"
          value={project}
          onChange={(e) => setProject(e.target.value)}
        >
          <option value="">모든 프로젝트</option>
          {resultProjects.map((p) => (
            <option key={p.project_id} value={p.project_id}>
              {p.project_name}
            </option>
          ))}
        </Select>
        <Select aria-label="평가유형 필터" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">모든 평가유형</option>
          {Object.entries(EVAL_TYPES).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </div>
      <FilterPanel label="평가일 검색" activeCount={[from, to].filter(Boolean).length}>
        <div className="flex flex-wrap items-end gap-3 px-6 pt-6 pb-4">
          <span className="text-xs text-muted">평가일</span>
          <div className="flex items-center gap-2 text-muted [&_input]:w-[145px] [&_input]:text-xs">
            <Input
              aria-label="평가일 검색 시작"
              type="date"
              value={from}
              onInput={(e) => setFrom(e.currentTarget.value)}
            />
            <span>~</span>
            <Input
              aria-label="평가일 검색 종료"
              type="date"
              min={from}
              value={to}
              onInput={(e) => setTo(e.currentTarget.value)}
            />
          </div>
          <Button
            variant="text"
            size="plain"
            onClick={() => {
              setFrom('')
              setTo('')
            }}
          >
            기간 초기화
          </Button>
        </div>
      </FilterPanel>
    </>
  )
}
