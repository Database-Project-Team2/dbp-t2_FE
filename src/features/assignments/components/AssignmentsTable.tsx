import { Avatar } from '@/shared/ui/data/Avatar'
import { Badge } from '@/shared/ui/feedback/Badge'
import { Button } from '@/shared/ui/actions/Button'
import { dateLabel } from '@/shared/lib/date'
import { Empty } from '@/shared/ui/feedback/Empty'
import { go } from '@/app/routing/navigation'
import { PersonInline } from '@/shared/ui/data/PersonInline'
import { ROLES } from '@/shared/model/labels'
import { Table } from '@/shared/ui/data/Table'
import { useStore } from '@/store/StoreContext'
import type { Member } from '@/shared/model/entities'

export function AssignmentsTable({ rows }: { rows: Member[] }) {
  const { db } = useStore()
  return (
    <div className="overflow-auto">
      <Table>
        <thead>
          <tr>
            <th>직원</th>
            <th>프로젝트</th>
            <th>수행 역할</th>
            <th>투입 시작일</th>
            <th>투입 종료일</th>
            <th>현재 상태</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => {
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
                <td>
                  <Button
                    variant="link"
                    size="plain"
                    onClick={() => go(`projects/${m.project_id}`)}
                  >
                    {db.projects.find((p) => p.project_id === m.project_id)?.project_name}
                  </Button>
                </td>
                <td>
                  <Badge>{ROLES[m.project_role]}</Badge>
                </td>
                <td>{dateLabel(m.assignment_start_date)}</td>
                <td>
                  {m.assignment_end_date
                    ? dateLabel(m.assignment_end_date)
                    : m.assignment_start_date
                      ? '현재'
                      : '—'}
                </td>
                <td>
                  <Badge
                    tone={
                      !m.assignment_start_date ? 'orange' : m.assignment_end_date ? 'gray' : 'green'
                    }
                  >
                    {!m.assignment_start_date
                      ? '투입 전'
                      : m.assignment_end_date
                        ? '투입 종료'
                        : '투입 중'}
                  </Badge>
                </td>
              </tr>
            )
          })}
        </tbody>
      </Table>
      {!rows.length && <Empty />}
    </div>
  )
}
