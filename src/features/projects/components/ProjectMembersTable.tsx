import { Avatar } from '@/shared/ui/data/Avatar'
import { Badge } from '@/shared/ui/feedback/Badge'
import { Button } from '@/shared/ui/actions/Button'
import { Card } from '@/shared/ui/layout/Card'
import { dateLabel } from '@/shared/lib/date'
import { Empty } from '@/shared/ui/feedback/Empty'
import { Icon } from '@/shared/ui/actions/Icon'
import { JOBS, ROLES } from '@/shared/model/labels'
import { PersonInline } from '@/shared/ui/data/PersonInline'
import { SectionHeading } from '@/shared/ui/layout/SectionHeading'
import { Table } from '@/shared/ui/data/Table'
import { useStore } from '@/store/StoreContext'
import type { Project, Member } from '@/shared/model/entities'

export function ProjectMembersTable({
  project: p,
  team,
  manageable,
  onAdd,
  onEdit,
}: {
  project: Project
  team: Member[]
  manageable: boolean
  onAdd: () => void
  onEdit: (member: Member) => void
}) {
  const { db } = useStore()
  return (
    <Card as="section">
      <SectionHeading>
        <div>
          <h2>
            함께하는 구성원 <span>{team.length}</span>
          </h2>
        </div>
        {manageable && !p.actual_end_date && (
          <Button variant="secondary" onClick={() => onAdd()}>
            <Icon name="plus" size={16} />
            구성원 추가
          </Button>
        )}
      </SectionHeading>
      <div className="overflow-auto">
        <Table>
          <thead>
            <tr>
              <th>직원</th>
              <th>직군</th>
              <th>수행 역할</th>
              <th>실제 투입기간</th>
              <th>상태</th>
              {manageable && <th>관리</th>}
            </tr>
          </thead>
          <tbody>
            {team.map((m) => {
              const e = db.employees.find((e) => e.employee_id === m.employee_id)!
              return (
                <tr key={m.member_id}>
                  <td>
                    <PersonInline>
                      <Avatar name={e.employee_name} id={e.employee_id} small />
                      <div>
                        <b>{e.employee_name}</b>
                        <small>{e.employee_no}</small>
                      </div>
                    </PersonInline>
                  </td>
                  <td>{JOBS[e.job_category]}</td>
                  <td>
                    <Badge tone={m.project_role === 'PM' ? 'accent' : 'gray'}>
                      {ROLES[m.project_role]}
                    </Badge>
                  </td>
                  <td>
                    {dateLabel(m.assignment_start_date)} ~{' '}
                    {m.assignment_end_date
                      ? dateLabel(m.assignment_end_date)
                      : m.assignment_start_date
                        ? '현재'
                        : '—'}
                  </td>
                  <td>
                    <Badge
                      tone={
                        !m.assignment_start_date
                          ? 'orange'
                          : m.assignment_end_date
                            ? 'gray'
                            : 'green'
                      }
                    >
                      {!m.assignment_start_date
                        ? '투입 전'
                        : m.assignment_end_date
                          ? '투입 종료'
                          : '투입 중'}
                    </Badge>
                  </td>
                  {manageable && (
                    <td>
                      {!p.actual_end_date && !m.assignment_end_date ? (
                        <Button variant="link" size="plain" onClick={() => onEdit(m)}>
                          기간 관리
                        </Button>
                      ) : (
                        <span className="text-xs text-muted">기록 확정</span>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </Table>
        {!team.length && (
          <Empty
            title="아직 구성원이 없어요"
            message="구성원을 추가하고 역할과 투입기간을 지정해 주세요."
          />
        )}
      </div>
    </Card>
  )
}
