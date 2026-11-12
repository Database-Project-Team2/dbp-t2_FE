import type { Employee } from '@/shared/model/entities'
import { EMPLOYMENT, JOBS } from '@/shared/model/labels'
import { Avatar } from '@/shared/ui/data/Avatar'
import { Badge } from '@/shared/ui/feedback/Badge'

export function EmployeeIdentity({ employee }: { employee: Employee }) {
  return (
    <div className="mt-1 mb-7 flex items-center gap-4">
      <div className="flex min-w-0 items-center gap-4">
        <Avatar
          name={employee.employee_name}
          id={employee.employee_id}
          className="size-16 rounded-3xl text-lg"
        />
        <div className="min-w-0">
          <h2 className="flex flex-wrap items-center gap-2.5 text-2xl">
            {employee.employee_name}
            <Badge tone="green">{EMPLOYMENT[employee.employment_status]}</Badge>
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-secondary">
            <span>{JOBS[employee.job_category]}</span>
            <span aria-hidden="true" className="h-3 w-px bg-line" />
            <dl className="flex items-baseline gap-2">
              <dt className="text-xs text-muted">사번</dt>
              <dd className="font-medium tabular-nums select-all">{employee.employee_no}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
