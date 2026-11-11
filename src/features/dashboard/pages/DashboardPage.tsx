import { useState } from 'react'
import { Button } from '@/shared/ui/actions/Button'
import { cn } from '@/shared/lib/cn'
import { dateLabel } from '@/shared/lib/date'
import { Icon } from '@/shared/ui/actions/Icon'
import { Input } from '@/shared/ui/forms/Input'
import { isAssigned } from '@/shared/domain/assignments'
import { isManagement, visibleProjects } from '@/shared/domain/permissions'
import { PageHeader } from '@/shared/ui/layout/PageHeader'
import { projectStatus, ongoingProjectMembers } from '@/shared/domain/projects'
import { Stat } from '@/shared/ui/data/Stat'
import { useStore } from '@/store/StoreContext'
import { DashboardDetails } from '../components/DashboardDetails'
import { OngoingProjectsCard } from '../components/OngoingProjectsCard'
import { PendingTasksCard } from '../components/PendingTasksCard'

export function DashboardPage() {
  const { db, user, today } = useStore()
  const me = user!
  const manager = isManagement(me)
  const [date, setDate] = useState(today)
  const projects = visibleProjects(db, me)
  const ongoing = projects.filter((p) => projectStatus(p, date) === '진행 중')
  const members = ongoingProjectMembers(db, date).filter(
    (m) => manager || m.employee_id === me.employee_id,
  )
  const unique = new Set(members.map((m) => m.employee_id)).size
  const pending = projects.filter((p) => p.actual_end_date && !p.evaluation_reported_date)
  const overdue = ongoing.filter((p) => p.planned_end_date < date)
  const available = db.employees.filter(
    (e) =>
      e.employment_status === 'ACTIVE' &&
      !db.members.some((m) => m.employee_id === e.employee_id && isAssigned(m, today)),
  )
  const historical = date !== today
  return (
    <>
      <PageHeader
        title="업무 현황"
        description={`${me.employee_name}님, ${manager ? '프로젝트와 팀의 주요 현황을 확인하세요.' : '참여 프로젝트와 할 일을 확인하세요.'}`}
        actions={
          <label
            className={cn(
              'flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-1 text-muted',
              '[&_input]:w-auto [&_input]:border-0 [&_input]:bg-transparent [&_input]:px-0',
              '[&_input]:py-2 [&_input]:text-xs [&_input]:focus:ring-0',
            )}
          >
            <Icon name="calendar" size={18} />
            <span className="sr-only">현황 기준일</span>
            <Input
              aria-label="현황 기준일"
              type="date"
              value={date}
              max={today}
              onInput={(e) => e.currentTarget.value && setDate(e.currentTarget.value)}
            />
          </label>
        }
      />
      {historical && (
        <p className="mb-5 flex items-center gap-5 text-xs text-secondary">
          {dateLabel(date)} 시점의 진행 프로젝트와 투입 인원을 조회 중이에요.{' '}
          <Button variant="text" size="plain" onClick={() => setDate(today)}>
            오늘로 돌아가기
          </Button>
        </p>
      )}
      <div className="mb-8 grid grid-cols-4 rounded-[18px] border border-line bg-white py-7">
        <Stat
          label={historical ? '당시 진행 프로젝트' : '진행 중 프로젝트'}
          value={ongoing.length}
          unit="개"
          detail={`조회 가능한 전체 ${projects.length}개 프로젝트`}
          icon="folder"
        />
        <Stat
          label={manager ? '프로젝트 투입 인원' : '내 투입 프로젝트'}
          value={manager ? unique : members.length}
          unit={manager ? '명' : '개'}
          detail={`${dateLabel(date)} 기준 · 중복 인원 제외`}
          icon="people"
          tone="purple"
        />
        <Stat
          label={manager ? '현재 투입 가능한 직원' : '누적 참여 프로젝트'}
          value={manager ? available.length : projects.length}
          unit={manager ? '명' : '개'}
          detail={manager ? '현재 재직 중 · 오늘 미투입' : '완료한 프로젝트 포함'}
          icon="user"
          tone="green"
        />
        <Stat
          label="고객평가 보고 대기"
          value={pending.length}
          unit="건"
          detail="현재 종료 프로젝트 중 미보고"
          icon="check"
          tone="orange"
        />
      </div>
      <div className="grid grid-cols-[1.15fr_1fr] gap-6 [&>section]:mb-0">
        <OngoingProjectsCard projects={ongoing} date={date} historical={historical} />
        <PendingTasksCard pending={pending} overdue={overdue} />
      </div>
      <DashboardDetails projects={projects} date={date} members={members} />
    </>
  )
}
