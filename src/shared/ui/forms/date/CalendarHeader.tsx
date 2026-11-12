import { Icon } from '../../actions/Icon'
export type CalendarView = 'days' | 'months' | 'years'
export function CalendarHeader({
  year,
  month,
  view,
  yearPage,
  onView,
  onNavigate,
  previousDisabled,
  nextDisabled,
}: {
  year: number
  month: number
  view: CalendarView
  yearPage: number
  onView: (view: CalendarView) => void
  onNavigate: (direction: number) => void
  previousDisabled: boolean
  nextDisabled: boolean
}) {
  const unit = view === 'days' ? '달' : view === 'months' ? '연도' : '연도 목록'
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <button
        type="button"
        aria-label={'이전 ' + unit}
        disabled={previousDisabled}
        onClick={() => onNavigate(-1)}
        className="flex size-8 items-center justify-center rounded-lg text-secondary hover:bg-canvas"
      >
        <Icon name="arrow" size={16} className="rotate-180" />
      </button>
      <div className="flex items-center gap-0.5 text-sm font-bold" aria-live="polite">
        {view === 'years' ? (
          <span>
            {yearPage} – {Math.min(yearPage + 11, 9999)}
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onView('years')}
              aria-label="연도 선택"
              className="rounded-lg px-2 py-1.5 hover:bg-brand-soft hover:text-brand-ink"
            >
              {year}년
            </button>
            <button
              type="button"
              onClick={() => onView(view === 'months' ? 'days' : 'months')}
              aria-label="월 선택"
              className="rounded-lg px-2 py-1.5 hover:bg-brand-soft hover:text-brand-ink"
            >
              {month}월
            </button>
          </>
        )}
      </div>
      <button
        type="button"
        aria-label={'다음 ' + unit}
        disabled={nextDisabled}
        onClick={() => onNavigate(1)}
        className="flex size-8 items-center justify-center rounded-lg text-secondary hover:bg-canvas"
      >
        <Icon name="arrow" size={16} />
      </button>
    </div>
  )
}
