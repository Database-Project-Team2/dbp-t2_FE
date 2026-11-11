import { useState } from 'react'
import { Button } from '@/shared/ui/actions/Button'
import { Card } from '@/shared/ui/layout/Card'
import { downloadCsv, csvContent } from '@/shared/lib/csv'
import { Field } from '@/shared/ui/forms/Field'
import { FilterPanel } from '@/shared/ui/forms/FilterPanel'
import { Icon } from '@/shared/ui/actions/Icon'
import { Input } from '@/shared/ui/forms/Input'
import { isAssigned } from '@/shared/domain/assignments'
import { overlapsPeriod, dateLabel } from '@/shared/lib/date'
import { PageHeader } from '@/shared/ui/layout/PageHeader'
import { ROLES } from '@/shared/model/labels'
import { SearchField } from '@/shared/ui/forms/SearchField'
import { Select } from '@/shared/ui/forms/Select'
import { useStore } from '@/store/StoreContext'
import { visibleHistory, isManagement } from '@/shared/domain/permissions'
import type { Notice } from '@/app/routing/navigation'
import { AssignmentsTable } from '../components/AssignmentsTable'

export function AssignmentsPage({ onNotice }: { onNotice: Notice }) {
  const { db, user, today } = useStore()
  const [query, setQuery] = useState('')
  const [project, setProject] = useState('')
  const [role, setRole] = useState('')
  const [date, setDate] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const scoped = visibleHistory(db, user!)
  const projects = db.projects.filter((p) => scoped.some((m) => m.project_id === p.project_id))
  const rows = scoped.filter(
    (m) =>
      db.employees.find((e) => e.employee_id === m.employee_id)!.employee_name.includes(query) &&
      (!project || String(m.project_id) === project) &&
      (!role || m.project_role === role) &&
      (!date || isAssigned(m, date)) &&
      (!(from || to) || overlapsPeriod(m.assignment_start_date, m.assignment_end_date, from, to)),
  )
  return (
    <>
      <PageHeader
        title={isManagement(user!) ? '프로젝트 투입 이력' : '내 프로젝트 투입 이력'}
        description="직원별 프로젝트 참여 기간과 역할을 조회하세요."
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              downloadCsv(
                '프로젝트_투입이력.csv',
                csvContent(
                  ['직원', '사번', '프로젝트', '역할', '투입 시작일', '투입 종료일'],
                  rows.map((m) => {
                    const e = db.employees.find((e) => e.employee_id === m.employee_id)!
                    return [
                      e.employee_name,
                      e.employee_no,
                      db.projects.find((p) => p.project_id === m.project_id)?.project_name,
                      ROLES[m.project_role],
                      m.assignment_start_date,
                      m.assignment_end_date,
                    ]
                  }),
                ),
              )
              onNotice('현재 조회 조건의 투입 이력을 내려받았어요.')
            }}
          >
            <Icon name="download" size={17} />
            CSV 내보내기
          </Button>
        }
      />
      <Card>
        <div className="flex flex-wrap items-end gap-3 px-6 pt-6 pb-4">
          {isManagement(user!) && (
            <SearchField
              containerClassName="min-w-[200px] flex-1"
              placeholder="직원명 검색"
              aria-label="이력 직원명"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          )}
          <Select
            aria-label="이력 프로젝트"
            value={project}
            onChange={(e) => setProject(e.target.value)}
          >
            <option value="">모든 프로젝트</option>
            {projects.map((p) => (
              <option value={p.project_id} key={p.project_id}>
                {p.project_name}
              </option>
            ))}
          </Select>
          <Select
            aria-label="이력 수행 역할"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">모든 역할</option>
            {Object.entries(ROLES).map(([k, v]) => (
              <option value={k} key={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>
        <FilterPanel label="날짜로 상세 검색" activeCount={[date, from, to].filter(Boolean).length}>
          <div className="flex flex-wrap items-end gap-3 px-6 pt-6 pb-4">
            <Field label="특정일 투입 현황">
              <Input
                aria-label="과거 투입 기준일"
                type="date"
                max={today}
                value={date}
                onInput={(e) => setDate(e.currentTarget.value)}
              />
            </Field>
            <Field label="투입기간">
              <div className="flex items-center gap-2 text-muted [&_input]:w-[145px] [&_input]:text-xs">
                <Input
                  aria-label="투입기간 검색 시작"
                  type="date"
                  value={from}
                  onInput={(e) => setFrom(e.currentTarget.value)}
                />
                <span>~</span>
                <Input
                  aria-label="투입기간 검색 종료"
                  type="date"
                  min={from}
                  value={to}
                  onInput={(e) => setTo(e.currentTarget.value)}
                />
              </div>
            </Field>
            <Button
              variant="text"
              size="plain"
              onClick={() => {
                setDate('')
                setFrom('')
                setTo('')
              }}
            >
              날짜 초기화
            </Button>
          </div>
        </FilterPanel>
        <div className="flex min-h-8 items-center justify-between gap-4 px-6 pb-5 text-xs text-muted [&_b]:text-brand-ink [&>span:last-child]:text-[11px]">
          <span>
            총 <b>{rows.length}</b>건
          </span>
          <span>
            {date
              ? `${dateLabel(date)} 기준`
              : isManagement(user!)
                ? '전체 투입 이력 · 투입 전 포함'
                : '본인의 실제 투입 이력'}
          </span>
        </div>
        <AssignmentsTable rows={rows} />
      </Card>
    </>
  )
}
