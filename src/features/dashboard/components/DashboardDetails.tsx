import { cn } from '@/shared/lib/cn'
import { Icon } from '@/shared/ui/actions/Icon'

import type { Project, Member } from '@/shared/model/entities'
import { AssignmentSnapshot } from './AssignmentSnapshot'
import { ProjectTimeline } from './ProjectTimeline'

export function DashboardDetails({
  projects,
  date,
  members,
}: {
  projects: Project[]
  date: string
  members: Member[]
}) {
  return (
    <details
      className={cn(
        'group/details mt-7 rounded-2xl border border-line bg-white [&>summary]:flex',
        '[&>summary]:items-center [&>summary]:justify-between [&>summary]:px-7 [&>summary]:py-6',
        '[&>summary]:text-secondary [&>summary_b]:text-[13px] [&>summary_small]:ml-5',
        '[&>summary_small]:text-[11px] [&>summary_small]:text-muted',
        '[&>summary>svg]:transition-transform [&[open]>summary>svg]:rotate-180',
      )}
    >
      <summary>
        <span>
          <b>프로젝트 일정과 투입 현황</b>
          <small>연간 일정과 기준일별 구성원을 자세히 확인하세요.</small>
        </span>
        <Icon name="down" size={18} />
      </summary>
      <div
        className={cn(
          'border-t border-line [&>section]:m-0 [&>section]:rounded-none [&>section]:border-0',
          '[&>section]:shadow-none [&>section+section]:border-t [&>section:last-child]:rounded-b-2xl',
        )}
      >
        <ProjectTimeline projects={projects} />
        <AssignmentSnapshot members={members} date={date} />
      </div>
    </details>
  )
}
