import type { Employee } from '@/shared/model/entities'
import { EMPLOYMENT, JOBS } from '@/shared/model/labels'
import { Avatar } from '@/shared/ui/data/Avatar'
import { Badge } from '@/shared/ui/feedback/Badge'

export function EmployeeIdentity({ employee }: { employee: Employee }) {
  return (
    <div className="mt-1 mb-6 flex items-center justify-between gap-6">
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
          <p className="mt-2 text-sm text-secondary">{JOBS[employee.job_category]}</p>
        </div>
      </div>
      <dl className="shrink-0 rounded-xl border border-brand-line bg-brand-soft px-5 py-3">
        <dt className="text-xs font-medium text-brand-ink">사번</dt>
        <dd className="mt-1 text-2xl font-bold tracking-wide text-brand-ink tabular-nums select-all">
          {employee.employee_no}
        </dd>
      </dl>
    </div>
  )
}
