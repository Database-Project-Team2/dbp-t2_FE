import { useState } from 'react'
import { Button } from '@/shared/ui/actions/Button'
import { Card } from '@/shared/ui/layout/Card'
import { Icon } from '@/shared/ui/actions/Icon'
import { isManagement } from '@/shared/domain/permissions'
import { PageHeader } from '@/shared/ui/layout/PageHeader'
import { TabButton } from '@/shared/ui/actions/TabButton'
import { useSession } from '@/app/session/SessionContext'
import { LoadState } from '@/shared/ui/feedback/LoadState'
import type { Notice } from '@/app/routing/navigation'
import type { EligibleProject, EvaluationView } from '@/shared/api/types'
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
  const { user } = useSession()
  const manager = isManagement(user!)
  const [tab, setTab] = useState(initialTab)
  const [formProject, setFormProject] = useState<EligibleProject | null>(null)
  const [selected, setSelected] = useState<EvaluationView | null>(null)
  const [exportError, setExportError] = useState('')
  const search = useEvaluationSearch()
  const { mine, results } = search
  async function exportResults() {
    try {
      setExportError('')
      await downloadEvaluationResults(search.filters)
      onNotice('조회된 평가 기초자료를 내려받았어요.')
    } catch (error) {
      setExportError((error as Error).message)
    }
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
            <span>{search.total}</span>
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
            {exportError && <LoadState error={new Error(exportError)} />}
            {search.resultsLoaded ? (
              <EvaluationResultsTable results={results} onSelect={setSelected} />
            ) : (
              <LoadState error={search.resultsError} />
            )}
          </>
        )}
      </Card>
      {formProject && (
        <EvaluationFormDialog
          project={formProject}
          onClose={() => {
            setFormProject(null)
            search.reloadMine()
            search.reloadResults()
          }}
          onNotice={onNotice}
        />
      )}
      {selected && selected.comments_visible && (
        <EvaluationDetailDialog evaluation={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
