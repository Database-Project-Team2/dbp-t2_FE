import { useState } from 'react'
import { Button } from '@/shared/ui/actions/Button'
import { Card } from '@/shared/ui/layout/Card'
import { Icon } from '@/shared/ui/actions/Icon'
import { isManagement, canReadEvaluationComments } from '@/shared/domain/permissions'
import { PageHeader } from '@/shared/ui/layout/PageHeader'
import { TabButton } from '@/shared/ui/actions/TabButton'
import { useStore } from '@/store/StoreContext'
import type { Notice } from '@/app/routing/navigation'
import type { Project, EvaluationResult } from '@/shared/model/entities'
import { downloadEvaluationResults } from '../utils/downloadEvaluationResults'
import { EvaluationDetailDialog } from '../components/EvaluationDetailDialog'
import { EvaluationFilters } from '../components/EvaluationFilters'
import { EvaluationFormDialog } from '../components/EvaluationFormDialog'
import { EvaluationProjects } from '../components/EvaluationProjects'
import { EvaluationResultsTable } from '../components/EvaluationResultsTable'
import { useEvaluationSearch } from '../hooks/useEvaluationSearch'

export function EvaluationsPage({
  onNotice,
  initialTab = 'results',
}: {
  onNotice: Notice
  initialTab?: 'results' | 'write'
}) {
  const { db, user } = useStore()
  const me = user!
  const manager = isManagement(me)
  const [tab, setTab] = useState(initialTab)
  const [formProject, setFormProject] = useState<Project | null>(null)
  const [selected, setSelected] = useState<EvaluationResult | null>(null)
  const search = useEvaluationSearch()
  const { mine, evaluations, results } = search
  function exportResults() {
    downloadEvaluationResults(db, me, results)
    onNotice('조회된 평가 기초자료를 내려받았어요.')
  }

  return (
    <>
      <PageHeader
        title="프로젝트 평가"
        description="종료한 프로젝트의 평가를 작성하고 결과를 확인하세요."
        actions={
          <Button variant="primary" onClick={() => setTab('write')}>
            <Icon name="plus" size={18} />
            평가 작성
          </Button>
        }
      />
      <Card as="section">
        <div className="flex gap-6 border-b border-line px-6">
          <TabButton active={tab === 'results'} onClick={() => setTab('results')}>
            {manager ? '전체 평가 결과' : '참여 프로젝트 평가'}
            <span>{evaluations.length}</span>
          </TabButton>
          <TabButton active={tab === 'write'} onClick={() => setTab('write')}>
            평가할 프로젝트<span>{mine.length}</span>
          </TabButton>
        </div>
        {tab === 'write' ? (
          <EvaluationProjects projects={mine} onWrite={setFormProject} />
        ) : (
          <>
            <EvaluationFilters search={search} />
            <div className="flex min-h-8 items-center justify-between gap-4 px-6 pb-5 text-xs text-muted [&_b]:text-brand-ink [&>span:last-child]:text-[11px]">
              <span>
                총 <b>{results.length}</b>건
              </span>
              <Button variant="secondary" size="small" onClick={exportResults}>
                <Icon name="download" size={15} />
                CSV 내보내기
              </Button>
            </div>
            <EvaluationResultsTable results={results} onSelect={setSelected} />
          </>
        )}
      </Card>
      {formProject && (
        <EvaluationFormDialog
          project={formProject}
          onClose={() => setFormProject(null)}
          onNotice={onNotice}
        />
      )}
      {selected && canReadEvaluationComments(db, me, selected) && (
        <EvaluationDetailDialog evaluation={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
