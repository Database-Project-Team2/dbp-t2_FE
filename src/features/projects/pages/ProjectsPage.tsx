import { useState } from 'react'
import { completeDate } from '@/shared/lib/date'
import { Button } from '@/shared/ui/actions/Button'
import { Card } from '@/shared/ui/layout/Card'
import { Empty } from '@/shared/ui/feedback/Empty'
import { DateInput } from '@/shared/ui/forms/DateInput'
import { FilterPanel } from '@/shared/ui/forms/FilterPanel'
import { Icon } from '@/shared/ui/actions/Icon'
import { PageHeader } from '@/shared/ui/layout/PageHeader'
import { SearchField } from '@/shared/ui/forms/SearchField'
import { TabButton } from '@/shared/ui/actions/TabButton'
import type { Notice } from '@/app/routing/navigation'
import { useSession } from '@/app/session/SessionContext'
import { isManagement } from '@/shared/domain/permissions'
import { projectsApi } from '@/shared/api/resources'
import { useApi } from '@/shared/api/useApi'
import { LoadState } from '@/shared/ui/feedback/LoadState'
import type { ProjectStatus } from '@/shared/api/types'
import type { Project } from '@/shared/model/entities'
import { ProjectDetailLoader } from './ProjectDetailPage'
import { ProjectFormDialog } from '../components/ProjectFormDialog'
import { ProjectGrid } from '../components/ProjectGrid'

export function ProjectsPage({ id, onNotice }: { id?: number; onNotice: Notice }) {
  const { user, today } = useSession()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('전체')
  const [client, setClient] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [form, setForm] = useState<Project | null>(null)
  const statusFilter: Record<string, ProjectStatus | undefined> = {
    전체: undefined,
    '진행 중': 'IN_PROGRESS',
    종료: 'CLOSED',
  }
  // 조회 범위(경영진 전체 / 직원 소속 프로젝트)와 검색은 서버가 처리합니다.
  const list = useApi(
    () =>
      id
        ? Promise.resolve(null)
        : projectsApi.list({
            project_name: query,
            client_name: client,
            status: statusFilter[status],
            from: completeDate(from),
            to: completeDate(to),
          }),
    [id, query, client, status, completeDate(from), completeDate(to)],
  )
  if (id) {
    return <ProjectDetailLoader key={id} id={id} onNotice={onNotice} />
  }
  const filtered = list.data?.data ?? []
  const counts = list.data?.status_counts
  const tabCount = (s: string) =>
    !counts
      ? 0
      : s === '전체'
        ? counts.NOT_STARTED + counts.IN_PROGRESS + counts.CLOSED
        : counts[statusFilter[s]!]
  const newProject: Project = {
    project_id: 0,
    project_name: '',
    client_id: 0,
    actual_start_date: today,
    planned_end_date: today,
    actual_end_date: null,
    evaluation_requested_date: null,
    evaluation_received_date: null,
    evaluation_reported_date: null,
  }
  return (
    <>
      <PageHeader
        title="프로젝트"
        description={
          isManagement(user!)
            ? '프로젝트를 찾고 일정과 구성원을 관리하세요.'
            : '내가 속한 프로젝트의 일정과 구성원을 확인하세요.'
        }
        actions={
          isManagement(user!) && (
            <Button variant="primary" onClick={() => setForm(newProject)}>
              <Icon name="plus" size={18} />
              프로젝트 등록
            </Button>
          )
        }
      />
      <Card>
        <div className="flex gap-6 border-b border-line px-6">
          {['전체', '진행 중', '종료'].map((s) => (
            <TabButton key={s} active={status === s} onClick={() => setStatus(s)}>
              {s}
              <span>{tabCount(s)}</span>
            </TabButton>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-3 px-6 pt-6 pb-4">
          <SearchField
            containerClassName="min-w-[200px] flex-1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="프로젝트명 검색"
            aria-label="프로젝트명 검색"
          />
          <SearchField
            containerClassName=""
            value={client}
            onChange={(e) => setClient(e.target.value)}
            aria-label="발주처명 검색"
            placeholder="발주처명 검색"
          />
        </div>
        <FilterPanel label="수행기간 검색" activeCount={[from, to].filter(Boolean).length}>
          <div className="flex flex-wrap items-end gap-3 px-6 pt-6 pb-4">
            <div className="flex items-center gap-2 text-muted [&_input]:w-[145px] [&_input]:text-xs">
              <DateInput aria-label="수행기간 시작" value={from} onValueChange={setFrom} />
              <span>~</span>
              <DateInput aria-label="수행기간 종료" value={to} min={from} onValueChange={setTo} />
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
        <div className="flex min-h-8 items-center justify-between gap-4 px-6 pb-5 text-xs text-muted [&_b]:text-brand-ink [&>span:last-child]:text-[11px]">
          <span>
            총 <b>{filtered.length}</b>개 프로젝트
          </span>
          <span>이름·발주처·기간을 함께 검색할 수 있어요</span>
        </div>
        {list.data ? <ProjectGrid projects={filtered} /> : <LoadState error={list.error} />}
        {list.data && !filtered.length && (
          <Empty
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery('')
                  setStatus('전체')
                  setClient('')
                  setFrom('')
                  setTo('')
                }}
              >
                필터 초기화
              </Button>
            }
          />
        )}
      </Card>
      {form && (
        <ProjectFormDialog
          project={form}
          onClose={() => {
            setForm(null)
            list.reload()
          }}
          onNotice={onNotice}
        />
      )}
    </>
  )
}
