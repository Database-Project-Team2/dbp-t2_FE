import { useState } from 'react'
import { DateInput } from '@/shared/ui/forms/DateInput'
import { Button } from '@/shared/ui/actions/Button'
import { dateLabel } from '@/shared/lib/date'
import { isManagement } from '@/shared/domain/permissions'
import { PageHeader } from '@/shared/ui/layout/PageHeader'
import { projectStatus, ongoingProjectMembers } from '@/shared/domain/projects'
import { useStore } from '@/store/StoreContext'
import { DashboardDetails } from '../components/DashboardDetails'
import { ManagementOverview } from '../components/ManagementOverview'
import { EmployeeOverview } from '../components/EmployeeOverview'
import { OngoingProjectsCard } from '../components/OngoingProjectsCard'
import { PendingTasksCard } from '../components/PendingTasksCard'
import { PersonalTasksCard } from '../components/PersonalTasksCard'
import { personalProjects } from '../model/dashboardOverview'

export function DashboardPage() {
  const { db, user, today } = useStore()
  const manager = isManagement(user!)
  const [date, setDate] = useState(today)
  const historical = manager && date !== today
  const ongoing = manager
    ? db.projects.filter((project) => projectStatus(project, date) === '진행 중')
    : personalProjects(db, user!, today)
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
              onValueChange={(value) => value && setDate(value)}
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
      {manager ? <ManagementOverview date={date} /> : <EmployeeOverview />}
      <div className="grid grid-cols-[1.15fr_1fr] items-start gap-6 [&>section]:mb-0">
        <OngoingProjectsCard
          projects={ongoing}
          date={manager ? date : today}
          historical={historical}
          personal={!manager}
        />
        {manager ? (
          <PendingTasksCard
            pending={db.projects.filter(
              (project) => project.actual_end_date && !project.evaluation_reported_date,
            )}
            overdue={ongoing.filter((project) => project.planned_end_date < date)}
          />
        ) : (
          <PersonalTasksCard />
        )}
      </div>
      {manager && (
        <DashboardDetails
          projects={db.projects}
          date={date}
          members={ongoingProjectMembers(db, date)}
        />
      )}
    </>
  )
}
