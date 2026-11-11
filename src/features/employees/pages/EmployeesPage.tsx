import { useState } from 'react'
import { Badge } from '@/shared/ui/feedback/Badge'
import { Button } from '@/shared/ui/actions/Button'
import { Card } from '@/shared/ui/layout/Card'
import { Field } from '@/shared/ui/forms/Field'
import { FilterPanel } from '@/shared/ui/forms/FilterPanel'
import { Icon } from '@/shared/ui/actions/Icon'
import { Input } from '@/shared/ui/forms/Input'
import { isAssigned } from '@/shared/domain/assignments'
import { JOBS, EMPLOYMENT } from '@/shared/model/labels'
import { Modal } from '@/shared/ui/overlays/Modal'
import { PageHeader } from '@/shared/ui/layout/PageHeader'
import { SearchField } from '@/shared/ui/forms/SearchField'
import { Select } from '@/shared/ui/forms/Select'
import { useStore } from '@/store/StoreContext'
import type { Employee } from '@/shared/model/entities'
import type { Notice } from '@/app/routing/navigation'
import { EmployeeDetailDialog } from '../components/EmployeeDetailDialog'
import { EmployeesTable } from '../components/EmployeesTable'

export function EmployeesPage({ onNotice }: { onNotice: Notice }) {
  const { db, today } = useStore()
  const [query, setQuery] = useState('')
  const [job, setJob] = useState('')
  const [skill, setSkill] = useState('')
  const [career, setCareer] = useState('')
  const [assigned, setAssigned] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState<Employee | null>(null)
  const employees = db.employees.filter(
    (e) =>
      (!query ||
        (/^\d+$/.test(query) ? e.employee_no === query : e.employee_name.includes(query))) &&
      (!job || e.job_category === job) &&
      skill
        .split(',')
        .map((x) => x.trim().toLowerCase())
        .filter(Boolean)
        .every((x) => (e.skill_description || '').toLowerCase().includes(x)) &&
      (!career || e.total_career_months >= Number(career)) &&
      (!status || e.employment_status === status) &&
      (!assigned ||
        db.members.some((m) => m.employee_id === e.employee_id && isAssigned(m, today)) ===
          (assigned === 'yes')),
  )
  return (
    <>
      <PageHeader
        title="직원 디렉터리"
        description="이름과 직군으로 동료를 찾고 경력을 확인하세요."
        actions={
          <Badge tone="accent">
            <Icon name="shield" size={14} />
            경영진 전용
          </Badge>
        }
      />
      <Card as="section">
        <div className="flex flex-wrap items-end gap-3 px-6 pt-6 pb-4">
          <SearchField
            containerClassName="min-w-[200px] flex-1"
            aria-label="직원명 또는 사번 검색"
            placeholder="이름 또는 사번 8자리"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select aria-label="직군" value={job} onChange={(e) => setJob(e.target.value)}>
            <option value="">모든 직군</option>
            {Object.entries(JOBS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>
        <FilterPanel activeCount={[status, assigned, skill, career].filter(Boolean).length}>
          <div className="flex flex-wrap items-end gap-3 px-6 pt-6 pb-4">
            <Select
              aria-label="재직 상태"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">모든 재직 상태</option>
              {Object.entries(EMPLOYMENT).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
            <Select
              aria-label="투입 여부"
              value={assigned}
              onChange={(e) => setAssigned(e.target.value)}
            >
              <option value="">모든 투입 상태</option>
              <option value="yes">현재 투입 중</option>
              <option value="no">현재 미투입</option>
            </Select>
            <Field label="기술·경험 키워드">
              <Input
                placeholder="예: Java, SQL (모두 포함)"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
              />
            </Field>
            <Field label="최소 총 경력 (개월)">
              <Input
                type="number"
                min="0"
                placeholder="예: 24"
                value={career}
                onChange={(e) => setCareer(e.target.value)}
              />
            </Field>
            <Button
              variant="text"
              size="plain"
              onClick={() => {
                setQuery('')
                setJob('')
                setSkill('')
                setCareer('')
                setAssigned('')
                setStatus('')
              }}
            >
              <Icon name="reset" size={15} />
              초기화
            </Button>
          </div>
        </FilterPanel>
        <div className="flex min-h-8 items-center justify-between gap-4 px-6 pb-5 text-xs text-muted [&_b]:text-brand-ink [&>span:last-child]:text-[11px]">
          <span>
            총 <b>{employees.length}</b>명
          </span>
          <span>이름 부분 검색 · 사번 8자리 검색</span>
        </div>
        <EmployeesTable employees={employees} onSelect={setSelected} />
      </Card>
      {selected && (
        <Modal wide title="직원 상세" onClose={() => setSelected(null)}>
          <EmployeeDetailDialog employee={selected} onNotice={onNotice} />
        </Modal>
      )}
    </>
  )
}
