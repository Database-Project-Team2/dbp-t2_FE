import { Avatar } from '@/shared/ui/data/Avatar'
import { Badge } from '@/shared/ui/feedback/Badge'
import { Button } from '@/shared/ui/actions/Button'
import { careerLabel } from '@/shared/lib/format'
import { cn } from '@/shared/lib/cn'
import { dateLabel } from '@/shared/lib/date'
import { downloadCsv, csvContent } from '@/shared/lib/csv'
import { Empty } from '@/shared/ui/feedback/Empty'
import { Icon } from '@/shared/ui/actions/Icon'
import { InfoGrid } from '@/shared/ui/data/InfoGrid'
import { ROLES, EMPLOYMENT, JOBS, EVAL_TYPES } from '@/shared/model/labels'
import { SectionHeading } from '@/shared/ui/layout/SectionHeading'
import { Table } from '@/shared/ui/data/Table'
import { useStore } from '@/store/StoreContext'
import { visibleHistory, isManagement } from '@/shared/domain/permissions'
import type { Employee } from '@/shared/model/entities'
import type { Notice } from '@/app/routing/navigation'

export function EmployeeDetailDialog({
  employee: e,
  onNotice,
}: {
  employee: Employee
  onNotice: Notice
}) {
  const { db, user } = useStore()
  const members = visibleHistory(db, user!).filter((m) => m.employee_id === e.employee_id)
  const evaluations = isManagement(user!)
    ? db.evaluations.filter((v) => members.some((m) => m.member_id === v.target_member_id))
    : []
  const exportCareer = () => {
    downloadCsv(
      `${e.employee_name}_경력기초자료.csv`,
      csvContent(
        ['사번', '직원명', '총 경력(개월)', '프로젝트', '역할', '투입 시작일', '투입 종료일'],
        members.map((m) => [
          e.employee_no,
          e.employee_name,
          e.total_career_months,
          db.projects.find((p) => p.project_id === m.project_id)?.project_name,
          ROLES[m.project_role],
          m.assignment_start_date || '투입 전',
          m.assignment_end_date || '',
        ]),
      ),
    )
    onNotice('경력 기초자료를 CSV로 내려받았어요.')
  }
  return (
    <>
      <div
        className={cn(
          'mt-1 mb-6 flex items-center gap-4 [&_h2]:flex [&_h2]:items-center [&_h2]:gap-2.5',
          '[&_h2]:text-2xl [&_p]:mt-2 [&_p]:text-xs [&_p]:text-muted [&>span]:size-16',
          '[&>span]:rounded-3xl [&>span]:text-lg',
        )}
      >
        <Avatar name={e.employee_name} id={e.employee_id} />
        <div>
          <h2>
            {e.employee_name} <Badge tone="green">{EMPLOYMENT[e.employment_status]}</Badge>
          </h2>
          <p>
            {e.employee_no} · {JOBS[e.job_category]}
          </p>
        </div>
      </div>
      <InfoGrid>
        <div>
          <dt>최종학력</dt>
          <dd>{e.education}</dd>
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
          <dd>******-*******</dd>
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
      <div
        className={cn(
          '[&_b]:text-xs [&_b]:font-medium [&_p]:mt-1.5 [&_p]:text-[11px] [&_p]:text-muted',
          '[&>div]:flex [&>div]:items-center [&>div]:gap-3.5 [&>div]:border-b [&>div]:border-line',
          '[&>div]:py-4 [&>div>div]:flex-1',
        )}
      >
        {members.map((m) => (
          <div key={m.member_id}>
            <span className="size-2 shrink-0 rounded-full border-2 border-brand-line" />
            <div>
              <b>{db.projects.find((p) => p.project_id === m.project_id)?.project_name}</b>
              <p>
                {dateLabel(m.assignment_start_date)} ~{' '}
                {m.assignment_end_date
                  ? dateLabel(m.assignment_end_date)
                  : m.assignment_start_date
                    ? '현재'
                    : '투입 전'}
              </p>
            </div>
            <Badge>{ROLES[m.project_role]}</Badge>
          </div>
        ))}
        {!members.length && (
          <Empty
            title="아직 참여한 프로젝트가 없어요"
            message="프로젝트에 투입되면 경력이 여기에 표시돼요."
          />
        )}
      </div>
      {isManagement(user!) && (
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
                    <td>
                      {
                        db.projects.find(
                          (p) =>
                            p.project_id ===
                            members.find((m) => m.member_id === v.target_member_id)?.project_id,
                        )?.project_name
                      }
                    </td>
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
