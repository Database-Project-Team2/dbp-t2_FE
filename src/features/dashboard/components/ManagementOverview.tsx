import { Stat } from '@/shared/ui/data/Stat'
import type { ManagementDashboard } from '@/shared/api/types'

export function ManagementOverview({
  dashboard: { metrics },
  historical,
}: {
  dashboard: ManagementDashboard
  historical: boolean
}) {
  return (
    <div className="mb-8 grid grid-cols-3 rounded-[18px] border border-line bg-white py-7">
      <Stat
        label={historical ? '당시 진행 프로젝트' : '진행 중 프로젝트'}
        value={metrics.ongoing_project_count}
        unit="개"
        detail={`전체 ${metrics.total_project_count}개 프로젝트`}
        icon="folder"
      />
      <Stat
        label="참여 프로젝트가 없는 직원"
        value={metrics.employees_without_projects}
        unit="명"
        detail="현재 재직 중 · 진행/예정 프로젝트 참여 없음"
        icon="user"
      />
      <Stat
        label="고객평가 보고 대기"
        value={metrics.customer_evaluation_pending}
        unit="건"
        detail="현재 종료 프로젝트 중 미보고"
        icon="check"
      />
    </div>
  )
}
