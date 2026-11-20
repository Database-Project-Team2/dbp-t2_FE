import { Stat } from '@/shared/ui/data/Stat'
import type { EmployeeDashboard } from '@/shared/api/types'
import { UpcomingPmProjects } from './UpcomingPmProjects'

export function EmployeeOverview({ dashboard }: { dashboard: EmployeeDashboard }) {
  const { metrics } = dashboard
  return (
    <>
      {dashboard.has_current_pm_assignment && (
        <UpcomingPmProjects upcoming={dashboard.upcoming_pm_projects} />
      )}
      <div className="mb-8 grid grid-cols-3 rounded-[18px] border border-line bg-white py-7">
        <Stat
          label="내 참여 프로젝트"
          value={metrics.active_project_count}
          unit="개"
          detail="현재 함께하고 있는 프로젝트"
          icon="folder"
        />
        <Stat
          label="투입 예정 프로젝트"
          value={metrics.upcoming_project_count}
          unit="개"
          detail="배정 후 실제 투입을 기다리고 있어요"
          icon="people"
        />
        <Stat
          label="작성할 평가"
          value={metrics.pending_evaluation_count}
          unit="건"
          detail={`${metrics.pending_evaluation_project_count}개 종료 프로젝트 · 아직 제출하지 않은 평가`}
          icon="check"
        />
      </div>
    </>
  )
}
