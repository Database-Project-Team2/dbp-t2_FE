import { Avatar } from '@/shared/ui/data/Avatar'
import { Badge } from '@/shared/ui/feedback/Badge'
import { Button } from '@/shared/ui/actions/Button'
import { careerLabel } from '@/shared/lib/format'
import { cn } from '@/shared/lib/cn'
import { Empty } from '@/shared/ui/feedback/Empty'
import { Icon } from '@/shared/ui/actions/Icon'
import { isAssigned } from '@/shared/domain/assignments'
import { JOBS, EMPLOYMENT } from '@/shared/model/labels'
import { Table } from '@/shared/ui/data/Table'
import { useStore } from '@/store/StoreContext'
import type { Employee } from '@/shared/model/entities'

export function EmployeesTable({
  employees,
  onSelect,
}: {
  employees: Employee[]
  onSelect: (employee: Employee) => void
}) {
  const { db, today } = useStore()
  return (
    <div className="overflow-auto">
      <Table>
        <thead>
          <tr>
            <th>직원</th>
            <th>직군 / 재직 상태</th>
            <th>총 경력</th>
            <th>기술·경험</th>
            <th>현재 투입</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {employees.map((e) => {
            const count = db.members.filter(
              (m) => m.employee_id === e.employee_id && isAssigned(m, today),
            ).length
            return (
              <tr key={e.employee_id}>
                <td>
                  <button
                    className={cn(
                      'flex items-center gap-2.5 p-0 text-left [&_b]:text-xs [&_b]:font-medium',
                      '[&_b]:text-secondary hover:[&_b]:text-brand-ink [&_small]:mt-1 [&_small]:block',
                      '[&_small]:text-[10px] [&_small]:text-muted',
                    )}
                    onClick={() => onSelect(e)}
                  >
                    <Avatar name={e.employee_name} id={e.employee_id} />
                    <span>
                      <b>{e.employee_name}</b>
                      <small>{e.employee_no}</small>
                    </span>
                  </button>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    {JOBS[e.job_category]}
                    <Badge tone={e.employment_status === 'ACTIVE' ? 'green' : 'gray'}>
                      {EMPLOYMENT[e.employment_status]}
                    </Badge>
                  </div>
                </td>
                <td>{careerLabel(e.total_career_months)}</td>
                <td className="max-w-[250px] text-[11px] leading-relaxed whitespace-normal text-muted">
                  {e.skill_description || '등록한 기술이 없어요'}
                </td>
                <td>
                  {count ? (
                    <Badge tone="accent">{count}개 프로젝트</Badge>
                  ) : (
                    <span className="text-xs text-muted">미투입</span>
                  )}
                </td>
                <td>
                  <Button
                    variant="icon"
                    size="icon"
                    aria-label={`${e.employee_name} 상세 보기`}
                    onClick={() => onSelect(e)}
                  >
                    <Icon name="arrow" size={16} />
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </Table>
      {!employees.length && <Empty />}
    </div>
  )
}
