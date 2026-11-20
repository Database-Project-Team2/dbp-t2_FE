import { useState } from 'react'
import { DateInput } from '@/shared/ui/forms/DateInput'
import { Button } from '@/shared/ui/actions/Button'
import { completeDate, dateLabel } from '@/shared/lib/date'
import { isManagement } from '@/shared/domain/permissions'
import { PageHeader } from '@/shared/ui/layout/PageHeader'
import { LoadState } from '@/shared/ui/feedback/LoadState'
import { useSession } from '@/app/session/SessionContext'
import { dashboardApi } from '@/shared/api/resources'
import { useApi } from '@/shared/api/useApi'
import { DashboardDetails } from '../components/DashboardDetails'
import { ManagementOverview } from '../components/ManagementOverview'
import { EmployeeOverview } from '../components/EmployeeOverview'
import { OngoingProjectsCard } from '../components/OngoingProjectsCard'
import { PendingTasksCard } from '../components/PendingTasksCard'
import { PersonalTasksCard } from '../components/PersonalTasksCard'

export function DashboardPage() {
  const { user, today } = useSession()
  const manager = isManagement(user!)
  const [date, setDate] = useState(today)
  const historical = manager && date !== today
  const { data, error } = useApi(
    () => dashboardApi.get(manager ? date : undefined),
    [manager, date],
  )
  return (
    <>
      <PageHeader
        title="업무 현황"
        description={`${user!.employee_name}님, ${manager ? '프로젝트와 팀의 주요 현황을 확인하세요.' : '참여 프로젝트와 할 일을 확인하세요.'}`}
        actions={
          manager && (
            <DateInput
              aria-label="현황 기준일"
              value={date}
              max={today}
              required
              onValueChange={(value) => completeDate(value) && setDate(value)}
            />
          )
        }
      />
      {historical && (
        <p className="mb-5 flex items-center gap-5 text-xs text-secondary">
          {dateLabel(date)} 시점의 진행 프로젝트와 투입 인원을 조회 중이에요.
          <Button variant="text" size="plain" onClick={() => setDate(today)}>
            오늘로 돌아가기
          </Button>
        </p>
      )}
      {!data ? (
        <LoadState error={error} />
      ) : data.view === 'MANAGEMENT' ? (
        <>
          <ManagementOverview dashboard={data} historical={historical} />
          <div className="grid grid-cols-[1.15fr_1fr] items-start gap-6 [&>section]:mb-0">
            <OngoingProjectsCard projects={data.ongoing_projects} historical={historical} />
            <PendingTasksCard
              pending={data.pending_customer_evaluations}
              overdue={data.overdue_projects}
            />
          </div>
          <DashboardDetails
            projects={data.timeline_projects}
            date={data.as_of}
            members={data.current_assignments}
          />
        </>
      ) : (
        <>
          <EmployeeOverview dashboard={data} />
          <div className="grid grid-cols-[1.15fr_1fr] items-start gap-6 [&>section]:mb-0">
            <OngoingProjectsCard projects={data.my_projects} historical={false} personal />
            <PersonalTasksCard
              tasks={data.evaluation_tasks}
              workflows={data.customer_evaluation_tasks}
            />
          </div>
        </>
      )}
    </>
  )
}
