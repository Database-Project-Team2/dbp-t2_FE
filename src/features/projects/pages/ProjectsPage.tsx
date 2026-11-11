import { useState } from 'react'
import { Button } from '@/shared/ui/actions/Button'
import { Card } from '@/shared/ui/layout/Card'
import { Empty } from '@/shared/ui/feedback/Empty'
import { FilterPanel } from '@/shared/ui/forms/FilterPanel'
import { Icon } from '@/shared/ui/actions/Icon'
import { Input } from '@/shared/ui/forms/Input'
import { matchesProjectSearch, projectStatus } from '@/shared/domain/projects'
import { PageHeader } from '@/shared/ui/layout/PageHeader'
import { SearchField } from '@/shared/ui/forms/SearchField'
import { TabButton } from '@/shared/ui/actions/TabButton'
import { type Notice, go } from '@/app/routing/navigation'
import { useStore } from '@/store/StoreContext'
import { visibleProjects, isManagement } from '@/shared/domain/permissions'
import type { Project } from '@/shared/model/entities'
import { ProjectDetailPage } from './ProjectDetailPage'
import { ProjectFormDialog } from '../components/ProjectFormDialog'
import { ProjectGrid } from '../components/ProjectGrid'

export function ProjectsPage({ id, onNotice }: { id?: number; onNotice: Notice }) {
  const { db, user, today } = useStore()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('전체')
  const [client, setClient] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [form, setForm] = useState<Project | null>(null)
  const projects = visibleProjects(db, user!)
  if (id) {
    const p = projects.find((p) => p.project_id === id)
    return p ? (
      <ProjectDetailPage key={id} project={p} onNotice={onNotice} />
    ) : (
      <Empty
        title="프로젝트를 볼 수 없어요"
        message="참여하지 않은 프로젝트이거나 존재하지 않는 프로젝트예요."
        action={
          <Button variant="primary" onClick={() => go('projects')}>
            목록으로
          </Button>
        }
      />
    )
  }
  const filtered = projects.filter((p) =>
    matchesProjectSearch(
      p,
      db.clients.find((c) => c.client_id === p.client_id)?.client_name || '',
      { query, client, status, from, to },
    ),
  )
  const newProject: Project = {
    project_id: 0,
    project_name: '',
    client_id: db.clients[0]?.client_id || 0,
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
        description="프로젝트를 찾고 일정과 구성원을 관리하세요."
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
              <span>
                {s === '전체'
                  ? projects.length
                  : projects.filter((p) => projectStatus(p) === s).length}
              </span>
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
              <Input
                type="date"
                aria-label="수행기간 시작"
                value={from}
                onInput={(e) => setFrom(e.currentTarget.value)}
              />
              <span>~</span>
              <Input
                type="date"
                aria-label="수행기간 종료"
                value={to}
                min={from}
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
        <div className="flex min-h-8 items-center justify-between gap-4 px-6 pb-5 text-xs text-muted [&_b]:text-brand-ink [&>span:last-child]:text-[11px]">
          <span>
            총 <b>{filtered.length}</b>개 프로젝트
          </span>
          <span>이름·발주처·기간을 함께 검색할 수 있어요</span>
        </div>
        <ProjectGrid projects={filtered} />
        {!filtered.length && (
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
        <ProjectFormDialog project={form} onClose={() => setForm(null)} onNotice={onNotice} />
      )}
    </>
  )
}
