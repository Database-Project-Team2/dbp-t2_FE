import { Avatar } from '@/shared/ui/data/Avatar'
import { Badge } from '@/shared/ui/feedback/Badge'
import { Button } from '@/shared/ui/actions/Button'
import { Card } from '@/shared/ui/layout/Card'
import { dateLabel } from '@/shared/lib/date'
import { Empty } from '@/shared/ui/feedback/Empty'
import { go } from '@/app/routing/navigation'
import { Icon } from '@/shared/ui/actions/Icon'
import { isManagement } from '@/shared/domain/permissions'
import { PersonInline } from '@/shared/ui/data/PersonInline'
import { ROLES } from '@/shared/model/labels'
import { SectionHeading } from '@/shared/ui/layout/SectionHeading'
import { Table } from '@/shared/ui/data/Table'
import { useStore } from '@/store/StoreContext'
import type { Member } from '@/shared/model/entities'

export function AssignmentSnapshot({ members, date }: { members: Member[]; date: string }) {
  const { db, user } = useStore()
  const manager = isManagement(user!)
  return (
    <Card as="section">
      <SectionHeading>
        <div>
          <h2>{manager ? '현재 투입 현황' : '내 투입 현황'}</h2>
          <p>{dateLabel(date)} 기준, 수행 역할과 투입기간</p>
        </div>
        <a
          className="inline-flex items-center gap-1 text-xs whitespace-nowrap text-muted hover:text-brand-ink"
          href="#/history"
        >
          이력 조회 <Icon name="arrow" size={14} />
        </a>
      </SectionHeading>
      <div className="overflow-auto">
        <Table>
          <thead>
            <tr>
              <th>직원</th>
              <th>프로젝트</th>
              <th>수행 역할</th>
              <th>투입 시작일</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const e = db.employees.find((e) => e.employee_id === m.employee_id)!
              return (
                <tr key={m.member_id}>
                  <td>
                    <PersonInline>
                      <Avatar name={e.employee_name} id={e.employee_id} small />
                      <b>{e.employee_name}</b>
                    </PersonInline>
                  </td>
                  <td>
                    <Button
                      variant="link"
                      size="plain"
                      onClick={() => go(`projects/${m.project_id}`)}
                    >
                      {db.projects.find((p) => p.project_id === m.project_id)!.project_name}
                    </Button>
                  </td>
                  <td>
                    <Badge>{ROLES[m.project_role]}</Badge>
                  </td>
                  <td>{dateLabel(m.assignment_start_date)}</td>
                  <td>
                    <span className="mr-1.5 inline-block size-1.5 rounded-full bg-success" />
                    투입 중
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
        {!members.length && (
          <Empty title="해당 시점에 투입된 직원이 없어요" message="다른 기준일로 확인해 보세요." />
        )}
      </div>
    </Card>
  )
}
