import { pendingEvaluationTasks } from '@/shared/domain/evaluationTasks'
import { Stat } from '@/shared/ui/data/Stat'
import { useStore } from '@/store/StoreContext'
import { currentMemberships, currentPmProjects } from '../model/dashboardOverview'
import { UpcomingPmProjects } from './UpcomingPmProjects'

export function EmployeeOverview() {
  const { db, user, today } = useStore()
  const own = currentMemberships(db, today).filter(
    (member) => member.employee_id === user!.employee_id,
  )
  const pending = pendingEvaluationTasks(db, user!)
  return (
    <>
      {currentPmProjects(db, user!, today).length > 0 && <UpcomingPmProjects />}
      <div className="mb-8 grid grid-cols-3 rounded-[18px] border border-line bg-white py-7">
        <Stat
          label="내 참여 프로젝트"
          value={
            own.filter(
              (member) => member.assignment_start_date && member.assignment_start_date <= today,
            ).length
          }
          unit="개"
          detail="현재 함께하고 있는 프로젝트"
          icon="folder"
        />
        <Stat
          label="투입 예정 프로젝트"
          value={
            own.filter(
              (member) => !member.assignment_start_date || member.assignment_start_date > today,
            ).length
          }
          unit="개"
          detail="배정 후 실제 투입을 기다리고 있어요"
          icon="people"
        />
        <Stat
          label="작성할 평가"
          value={pending.reduce((sum, task) => sum + task.count, 0)}
          unit="건"
          detail={`${pending.length}개 종료 프로젝트 · 아직 제출하지 않은 평가`}
          icon="check"
        />
      </div>
    </>
  )
}
