import { Card } from '@/shared/ui/layout/Card'
import { cn } from '@/shared/lib/cn'
import { go } from '@/app/routing/navigation'
import { SectionHeading } from '@/shared/ui/layout/SectionHeading'
import { useStore } from '@/store/StoreContext'
import type { Project } from '@/shared/model/entities'

export function ProjectTimeline({ projects }: { projects: Project[] }) {
  const { today } = useStore()
  return (
    <Card as="section">
      <SectionHeading>
        <div>
          <h2>올해의 프로젝트 흐름</h2>
          <p>{today.slice(0, 4)}년 · 실제 착수일과 종료일 기준</p>
        </div>
        <div
          className={cn(
            'flex gap-4 text-[10px] text-muted [&_i]:inline-block [&_i]:size-1.5 [&_i]:rounded-sm',
            '[&_i]:bg-brand [&_span]:flex [&_span]:items-center [&_span]:gap-1.5',
          )}
        >
          <span>
            <i className="bg-brand" />
            진행 중
          </span>
          <span>
            <i className="bg-muted" />
            종료
          </span>
        </div>
      </SectionHeading>
      <div className="overflow-auto px-6 pb-6">
        <div className="min-w-[630px]">
          <div className="mb-3 grid grid-cols-[190px_1fr] items-center text-[10px] text-muted [&>div]:grid [&>div]:grid-cols-12 [&>div]:text-center">
            <span>프로젝트</span>
            <div>
              {Array.from({ length: 12 }, (_, i) => (
                <span key={i}>{i + 1}월</span>
              ))}
            </div>
          </div>
          {projects
            .filter(
              (p) =>
                p.actual_start_date.slice(0, 4) <= today.slice(0, 4) &&
                (!p.actual_end_date || p.actual_end_date.slice(0, 4) >= today.slice(0, 4)),
            )
            .map((p) => {
              const year = today.slice(0, 4)
              const from = Math.max(Date.parse(`${year}-01-01`), Date.parse(p.actual_start_date))
              const to = Math.min(
                Date.parse(`${year}-12-31`),
                Date.parse(p.actual_end_date || today),
              )
              const days = Date.parse(`${year}-12-31`) - Date.parse(`${year}-01-01`) || 1
              const left = ((from - Date.parse(`${year}-01-01`)) / days) * 100
              const width = Math.max(1, ((to - from) / days) * 100)
              return (
                <div
                  className={cn(
                    'grid h-10 grid-cols-[190px_1fr] items-center',
                    '[&>button]:truncate [&>button]:p-0 [&>button]:text-left',
                    '[&>button]:text-[11px] [&>button]:text-secondary',
                  )}
                  key={p.project_id}
                >
                  <button onClick={() => go(`projects/${p.project_id}`)}>{p.project_name}</button>
                  <div className="relative h-full bg-[repeating-linear-gradient(to_right,#e9eaee_0,#e9eaee_1px,transparent_1px,transparent_8.333%)]">
                    <button
                      className={cn(
                        'absolute top-2 h-6 min-w-6 overflow-hidden rounded px-2 text-[10px] whitespace-nowrap',
                        p.actual_end_date
                          ? 'bg-canvas text-secondary'
                          : 'bg-brand-soft text-brand-ink',
                      )}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      onClick={() => go(`projects/${p.project_id}`)}
                      aria-label={`${p.project_name} 상세 보기`}
                    >
                      {p.actual_end_date ? '종료' : '진행 중'}
                    </button>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </Card>
  )
}
