import { dateLabel } from '@/shared/lib/date'
import { ongoingProjectMembers, projectStatus } from '@/shared/domain/projects'
import { Stat } from '@/shared/ui/data/Stat'
import { useStore } from '@/store/StoreContext'
import { employeesWithoutProjects } from '../model/dashboardOverview'

export function ManagementOverview({ date }: { date: string }) {
  const { db, today } = useStore()
  const ongoing = db.projects.filter((project) => projectStatus(project, date) === '진행 중')
  const assigned = new Set(ongoingProjectMembers(db, date).map((member) => member.employee_id))
  return (
    <div className="mb-8 grid grid-cols-4 rounded-[18px] border border-line bg-white py-7">
      <Stat
        label={date === today ? '진행 중 프로젝트' : '당시 진행 프로젝트'}
        value={ongoing.length}
        unit="개"
        detail={`전체 ${db.projects.length}개 프로젝트`}
        icon="folder"
      />
      <Stat
        label="프로젝트 투입 인원"
        value={assigned.size}
        unit="명"
        detail={`${dateLabel(date)} 기준 · 중복 인원 제외`}
        icon="people"
      />
      <Stat
        label="참여 프로젝트가 없는 직원"
        value={employeesWithoutProjects(db, today).length}
        unit="명"
        detail="현재 재직 중 · 진행/예정 프로젝트 참여 없음"
        icon="user"
      />
      <Stat
        label="고객평가 보고 대기"
        value={
          db.projects.filter(
            (project) => project.actual_end_date && !project.evaluation_reported_date,
          ).length
        }
        unit="건"
        detail="현재 종료 프로젝트 중 미보고"
        icon="check"
      />
    </div>
  )
}
