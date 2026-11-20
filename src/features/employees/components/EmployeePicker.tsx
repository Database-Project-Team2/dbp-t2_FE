import { useState } from 'react'
import { JOBS } from '@/shared/model/labels'
import { Avatar } from '@/shared/ui/data/Avatar'
import { Button } from '@/shared/ui/actions/Button'
import { Empty } from '@/shared/ui/feedback/Empty'
import { Field } from '@/shared/ui/forms/Field'
import { SearchField } from '@/shared/ui/forms/SearchField'
import { cn } from '@/shared/lib/cn'
import { projectsApi } from '@/shared/api/resources'
import { useApi } from '@/shared/api/useApi'
import type { MemberCandidate } from '@/shared/api/types'

export function EmployeePicker({
  projectId,
  value,
  onSelect,
}: {
  projectId: number
  value: number
  onSelect: (employeeId: number) => void
}) {
  const [query, setQuery] = useState('')
  const [skills, setSkills] = useState('')
  const [picked, setPicked] = useState<MemberCandidate | null>(null)
  // 서버가 재직 중이고 이 프로젝트에 없는 직원만 돌려줍니다. 숫자만 입력하면 사번으로 찾습니다.
  const term = query.trim()
  const byNumber = /^\d+$/.test(term)
  const { data } = useApi(
    () =>
      projectsApi.candidates(projectId, {
        employee_name: byNumber ? undefined : term,
        employee_no: byNumber ? term : undefined,
        skill: skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
      }),
    [projectId, term, skills],
  )
  const results = data?.data ?? []
  const selected = picked && picked.employee_id === value ? picked : null
  return (
    <fieldset className="mb-6 min-w-0">
      <legend className="mb-3 text-sm font-semibold">추가할 직원</legend>
      <div className="grid grid-cols-2 gap-3">
        <Field label="이름·사번 검색">
          <SearchField
            containerClassName=""
            placeholder="이름 또는 사번"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Field>
        <Field label="기술·경험 키워드">
          <SearchField
            containerClassName=""
            placeholder="예: Java, SQL (모두 포함)"
            value={skills}
            onChange={(event) => setSkills(event.target.value)}
          />
        </Field>
      </div>
      <div className="my-3 flex items-center justify-between text-xs text-muted">
        <span aria-live="polite">검색 결과 {results.length}명</span>
        <span>다른 프로젝트에 참여 중인 직원도 추가할 수 있어요</span>
      </div>
      <div className="max-h-64 [scrollbar-width:thin] overflow-y-auto rounded-xl border border-line">
        {results.map((employee) => (
          <label
            key={employee.employee_id}
            className={cn(
              'flex cursor-pointer items-center gap-3 border-b border-line p-4 last:border-b-0 hover:bg-subtle',
              value === employee.employee_id && 'bg-brand-soft',
            )}
          >
            <input
              className="size-4 shrink-0 accent-brand"
              type="radio"
              name="member-employee"
              value={employee.employee_id}
              checked={value === employee.employee_id}
              onChange={() => {
                setPicked(employee)
                onSelect(employee.employee_id)
              }}
            />
            <Avatar name={employee.employee_name} id={employee.employee_id} small />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-sm">
                <b>{employee.employee_name}</b>
                <span className="text-xs text-secondary">
                  사번 {employee.employee_no} · {JOBS[employee.job_category]}
                </span>
              </span>
              <span
                className="mt-1.5 block truncate text-xs text-muted"
                title={employee.skill_description || undefined}
              >
                {employee.skill_description || '등록된 기술·경험이 없어요'}
              </span>
            </span>
          </label>
        ))}
        {!results.length && (
          <Empty
            title="조건에 맞는 직원이 없어요"
            message="검색어를 바꿔보세요. 이미 이 프로젝트에 등록된 직원은 제외돼요."
          />
        )}
      </div>
      {selected && (
        <div className="mt-3 flex items-center justify-between rounded-lg bg-canvas px-4 py-3 text-xs">
          <span>
            선택한 직원 <b className="ml-2">{selected.employee_name}</b>
            <span className="ml-2 text-secondary">사번 {selected.employee_no}</span>
          </span>
          <Button type="button" variant="text" size="plain" onClick={() => onSelect(0)}>
            선택 해제
          </Button>
        </div>
      )}
    </fieldset>
  )
}
