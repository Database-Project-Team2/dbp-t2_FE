import { useState } from 'react'
import { Badge } from '@/shared/ui/feedback/Badge'
import { Button } from '@/shared/ui/actions/Button'
import { cn } from '@/shared/lib/cn'
import { Icon } from '@/shared/ui/actions/Icon'
import { PageHeader } from '@/shared/ui/layout/PageHeader'
import { PROJECT_STATUS } from '@/shared/model/labels'
import { Empty } from '@/shared/ui/feedback/Empty'
import { LoadState } from '@/shared/ui/feedback/LoadState'
import { ApiError } from '@/shared/api/client'
import { projectsApi } from '@/shared/api/resources'
import { useApi } from '@/shared/api/useApi'
import type { MemberView, ProjectDetail } from '@/shared/api/types'
import { type Notice, go } from '@/app/routing/navigation'
import { useSession } from '@/app/session/SessionContext'
import type { Member } from '@/shared/model/entities'
import { CustomerEvaluationCard } from '../components/CustomerEvaluationCard'
import { RemoveMemberDialog } from '../components/RemoveMemberDialog'
import { MemberFormDialog } from '../components/MemberFormDialog'
import { ProjectActionDialog } from '../components/ProjectActionDialog'
import { ProjectClientCard } from '../components/ProjectClientCard'
import { ProjectFormDialog } from '../components/ProjectFormDialog'
import { ProjectMembersTable } from '../components/ProjectMembersTable'
import { ProjectSummary } from '../components/ProjectSummary'

/** 상세와 구성원을 서버에서 읽습니다. 조회 범위 밖(404)이면 안내를 보여 줍니다. */
export function ProjectDetailLoader({ id, onNotice }: { id: number; onNotice: Notice }) {
  const detail = useApi(() => Promise.all([projectsApi.detail(id), projectsApi.members(id)]), [id])
  if (detail.error instanceof ApiError && detail.error.status === 404) {
    return (
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
  if (!detail.data) return <LoadState error={detail.error} />
  const [project, members] = detail.data
  return (
    <ProjectDetailPage
      project={project}
      team={members}
      onChanged={detail.reload}
      onNotice={onNotice}
    />
  )
}

export function ProjectDetailPage({
  project: p,
  team,
  onChanged,
  onNotice,
}: {
  project: ProjectDetail
  team: MemberView[]
  onChanged: () => void
  onNotice: Notice
}) {
  const { today } = useSession()
  const [edit, setEdit] = useState(false)
  const [member, setMember] = useState<Member | null>(null)
  const [removing, setRemoving] = useState<Member | null>(null)
  const [workflow, setWorkflow] = useState(false)
  const [close, setClose] = useState(false)
  const client = p.client
  // 버튼 표시용 권한. 실제 권한은 각 API가 다시 검사합니다.
  const manageable = p.permissions.can_manage
  const pm = p.permissions.can_record_customer_evaluation
  const newMember: Member = {
    member_id: 0,
    project_id: p.project_id,
    employee_id: 0,
    project_role: 'PROGRAMMER',
    assignment_start_date: null,
    assignment_end_date: null,
  }

  return (
    <>
      <button
        className="mb-5 flex items-center gap-2 p-0 text-xs text-muted hover:text-brand-ink [&_span]:text-lg"
        onClick={() => go('projects')}
      >
        <span>←</span>프로젝트 목록
      </button>
      <PageHeader
        eyebrow={`PRJ-${String(p.project_id).padStart(3, '0')}`}
        title={p.project_name}
        description={client.client_name}
        actions={
          <>
            <Badge tone={p.actual_end_date ? 'gray' : 'accent'}>{PROJECT_STATUS[p.status]}</Badge>
            {manageable && !p.actual_end_date && (
              <>
                <Button variant="secondary" onClick={() => setEdit(true)}>
                  <Icon name="edit" size={16} />
                  정보 수정
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setClose(true)
                  }}
                >
                  프로젝트 종료
                </Button>
              </>
            )}
          </>
        }
      />
      <ProjectSummary project={p} memberCount={team.length} />
      {!p.actual_end_date && p.planned_end_date < today && (
        <div className="my-5 flex items-center gap-2 rounded-xl bg-canvas bg-warning-soft px-4 py-3.5 text-xs leading-relaxed text-secondary text-warning">
          <Icon name="clock" />
          예정 종료일이 지났어요. 실제 종료일을 기록하기 전까지는 진행 중으로 관리돼요.
        </div>
      )}
      <ProjectMembersTable
        project={p}
        team={team}
        manageable={manageable}
        onAdd={() => setMember(newMember)}
        onEdit={setMember}
        onRemove={setRemoving}
      />
      <div className="grid grid-cols-[1.45fr_1fr] gap-6 [&>section]:min-w-0">
        <CustomerEvaluationCard
          project={p}
          canRecord={pm}
          onRecord={() => {
            setWorkflow(true)
          }}
        />
        <ProjectClientCard client={client} />
      </div>
      {p.actual_end_date && (
        <div
          className={cn(
            'mb-6 flex items-center justify-between gap-5 rounded-xl bg-brand-soft p-6 [&_b]:block',
            '[&_b]:text-[13px] [&_small]:mt-2 [&_small]:block [&_small]:text-[11px]',
            '[&_small]:text-muted [&>div]:flex [&>div]:items-center [&>div]:gap-4',
            '[&>div]:text-brand-ink',
          )}
        >
          <div>
            <Icon name="check" size={28} />
            <span>
              <b>프로젝트를 함께한 동료에게 피드백을 남겨주세요</b>
              <small>업무수행과 커뮤니케이션, 두 가지 항목으로 평가해요.</small>
            </span>
          </div>
          <Button variant="primary" onClick={() => go('evaluations/write')}>
            평가하러 가기 <Icon name="arrow" size={16} />
          </Button>
        </div>
      )}
      {edit && (
        <ProjectFormDialog
          project={p}
          onClose={() => {
            setEdit(false)
            onChanged()
          }}
          onNotice={onNotice}
        />
      )}
      {member && (
        <MemberFormDialog
          member={member}
          onClose={() => {
            setMember(null)
            onChanged()
          }}
          onNotice={onNotice}
        />
      )}
      {removing && (
        <RemoveMemberDialog
          member={removing}
          onClose={() => {
            setRemoving(null)
            onChanged()
          }}
          onNotice={onNotice}
        />
      )}
      {(workflow || close) && (
        <ProjectActionDialog
          project={p}
          closing={close}
          onClose={() => {
            setWorkflow(false)
            setClose(false)
            onChanged()
          }}
          onNotice={onNotice}
        />
      )}
    </>
  )
}
