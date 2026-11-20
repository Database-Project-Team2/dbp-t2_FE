import { normalizeEducation } from '@/shared/model/employeeOptions'
import { Badge } from '@/shared/ui/feedback/Badge'
import { Button } from '@/shared/ui/actions/Button'
import { careerLabel } from '@/shared/lib/format'
import { cn } from '@/shared/lib/cn'
import { dateLabel } from '@/shared/lib/date'
import { downloadBlob } from '@/shared/lib/csv'
import { Empty } from '@/shared/ui/feedback/Empty'
import { Icon } from '@/shared/ui/actions/Icon'
import { InfoGrid } from '@/shared/ui/data/InfoGrid'
import { ROLES, EVAL_TYPES } from '@/shared/model/labels'
import { SectionHeading } from '@/shared/ui/layout/SectionHeading'
import { Table } from '@/shared/ui/data/Table'
import { useSession } from '@/app/session/SessionContext'
import { isManagement } from '@/shared/domain/permissions'
import { employeesApi, evaluationsApi } from '@/shared/api/resources'
import { useApi } from '@/shared/api/useApi'
import type { Employee } from '@/shared/model/entities'
import type { Notice } from '@/app/routing/navigation'
import { EmployeeIdentity } from './EmployeeIdentity'

export function EmployeeDetailDialog({
  employee: e,
  onNotice,
  layout = 'dialog',
}: {
  employee: Employee
  onNotice: Notice
  layout?: 'page' | 'dialog'
}) {
  const { user } = useSession()
  const manager = isManagement(user!)
  // 경영진은 투입 전 배정까지, 본인은 실제 투입 이력만 서버가 돌려줍니다.
  const members = useApi(() => employeesApi.career(e.employee_id), [e.employee_id]).data ?? []
  const evaluations =
    useApi(
      () =>
        manager
          ? evaluationsApi.search({ target_employee_id: e.employee_id }).then((page) => page.data)
          : Promise.resolve([]),
      [manager, e.employee_id],
    ).data ?? []
  const exportCareer = async () => {
    const file = await employeesApi.careerCsv(e.employee_id)
    downloadBlob(file.filename, file.blob)
    onNotice('경력 기초자료를 CSV로 내려받았어요.')
  }
  return (
    <>
      <EmployeeIdentity employee={e} />
      <InfoGrid
        className={cn(
          layout === 'page' &&
            'grid-cols-3 gap-x-10 gap-y-7 [&_dd]:text-sm [&_dd]:font-medium [&_dt]:text-xs',
        )}
      >
        <div>
          <dt>최종학력</dt>
          <dd>{normalizeEducation(e.education)}</dd>
        </div>
        <div>
          <dt>총 경력</dt>
          <dd>{careerLabel(e.total_career_months)}</dd>
        </div>
        <div>
          <dt>입사일</dt>
          <dd>{dateLabel(e.hire_date)}</dd>
        </div>
        <div>
          <dt>퇴사일</dt>
          <dd>{dateLabel(e.resignation_date)}</dd>
        </div>
        <div>
          <dt>주민등록번호</dt>
          <dd>{e.resident_no_masked || '******-*******'}</dd>
        </div>
        <div>
          <dt>로그인 ID</dt>
          <dd>{e.login_id}</dd>
        </div>
      </InfoGrid>
      <div className="py-6 [&_h3]:text-[13px] [&_p]:mt-3 [&_p]:text-xs [&_p]:whitespace-pre-wrap [&_p]:text-muted">
        <h3>기술과 경험</h3>
        <p>{e.skill_description || '아직 등록한 내용이 없어요.'}</p>
      </div>
      <SectionHeading className="border-t border-line px-0 pt-5 pb-4">
        <h3>프로젝트 경력 {members.length}건</h3>
        <Button variant="secondary" size="small" onClick={exportCareer}>
          <Icon name="download" size={15} />
          CSV 내보내기
        </Button>
      </SectionHeading>
      {members.length > 0 ? (
        <ul className="divide-y divide-line">
          {members.map((m) => (
            <li key={m.member_id} className="flex items-center gap-3.5 py-4">
              <span className="size-2 shrink-0 rounded-full border-2 border-brand-line" />
              <div className="min-w-0 flex-1">
                <b className="text-sm font-medium">{m.project.project_name}</b>
                <p className="mt-1.5 text-xs text-muted">
                  {dateLabel(m.assignment_start_date)} ~{' '}
                  {m.assignment_end_date
                    ? dateLabel(m.assignment_end_date)
                    : m.assignment_start_date
                      ? '현재'
                      : '투입 전'}
                </p>
              </div>
              <Badge>{ROLES[m.project_role]}</Badge>
            </li>
          ))}
        </ul>
      ) : (
        <Empty
          title="아직 참여한 프로젝트가 없어요"
          message="프로젝트에 투입되면 경력이 여기에 표시돼요."
        />
      )}
      {manager && (
        <div className="mt-7 [&_h3]:text-sm [&_h3_span]:ml-1 [&_h3_span]:text-brand-ink [&>p]:mt-2 [&>p]:mb-5 [&>p]:text-[11px] [&>p]:text-muted">
          <h3>
            평가 기초자료 <span>{evaluations.length}건</span>
          </h3>
          <p>인센티브·인사고과 자동 산정 없이, 항목별 원점수를 제공해요.</p>
          <div className="overflow-auto">
            <Table>
              <thead>
                <tr>
                  <th>유형</th>
                  <th>프로젝트</th>
                  <th>업무수행</th>
                  <th>소통</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((v) => (
                  <tr key={v.evaluation_id}>
                    <td>{EVAL_TYPES[v.evaluation_type]}</td>
                    <td>{v.project_name}</td>
                    <td>{v.work_performance_score}점</td>
                    <td>{v.communication_score}점</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {!evaluations.length && (
              <p className="text-xs text-muted">아직 등록된 평가가 없어요.</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
