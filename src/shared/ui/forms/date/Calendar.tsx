import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { today } from '../../../lib/date'
import { cn } from '../../../lib/cn'
import {
  addDays,
  addMonths,
  clampDate,
  inRange,
  isDate,
  monthAllowed,
  monthStart,
  parseDate,
} from './calendarDates'
import { CalendarHeader, type CalendarView } from './CalendarHeader'
import { CalendarGrid } from './CalendarGrid'

export function Calendar({
  value,
  min = '',
  max = '',
  required,
  onChoose,
}: {
  value: string
  min?: string
  max?: string
  required?: boolean
  onChoose: (value: string) => void
}) {
  const current = today()
  const initial = clampDate(isDate(value) ? value : current, min, max)
  const [focused, setFocused] = useState(initial)
  const [month, setMonth] = useState(monthStart(initial))
  const [view, setView] = useState<CalendarView>('days')
  const [yearPage, setYearPage] = useState(
    Math.max(1, Math.floor(Number(initial.slice(0, 4)) / 12) * 12),
  )
  const rootRef = useRef<HTMLDivElement>(null)
  const year = Number(month.slice(0, 4))
  const monthNumber = Number(month.slice(5, 7))
  const yearAllowed = (candidate: number) =>
    candidate >= 1 &&
    candidate <= 9999 &&
    (!min || candidate >= Number(min.slice(0, 4))) &&
    (!max || candidate <= Number(max.slice(0, 4)))
  useEffect(() => {
    rootRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.focus({ preventScroll: true })
  }, [focused, view])
  function moveFocus(date: string) {
    const next = clampDate(date, min || '0001-01-01', max || '9999-12-31')
    setFocused(next)
    setMonth(monthStart(next))
  }
  function navigate(direction: number) {
    if (view === 'years') setYearPage((page) => page + direction * 12)
    else if (view === 'months') setMonth(addMonths(month, direction * 12))
    else moveFocus(addMonths(focused, direction))
  }
  function onDayKey(event: KeyboardEvent<HTMLButtonElement>, date: string) {
    const offsets: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
      Home: -parseDate(date).getUTCDay(),
      End: 6 - parseDate(date).getUTCDay(),
    }
    if (event.key in offsets) {
      event.preventDefault()
      moveFocus(addDays(date, offsets[event.key]))
    } else if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault()
      moveFocus(addMonths(date, (event.key === 'PageUp' ? -1 : 1) * (event.shiftKey ? 12 : 1)))
    }
  }
  const canNavigate = (direction: number) =>
    view === 'days'
      ? monthAllowed(addMonths(month, direction), min, max)
      : view === 'months'
        ? yearAllowed(year + direction)
        : direction < 0
          ? yearAllowed(yearPage - 1)
          : yearAllowed(yearPage + 12)
  return (
    <div ref={rootRef} className="w-full p-2.5">
      <CalendarHeader
        year={year}
        month={monthNumber}
        view={view}
        yearPage={yearPage}
        onView={(next) => {
          setView(next)
          if (next === 'years') setYearPage(Math.max(1, Math.floor(year / 12) * 12))
        }}
        onNavigate={navigate}
        previousDisabled={!canNavigate(-1)}
        nextDisabled={!canNavigate(1)}
      />
      {view === 'days' ? (
        <CalendarGrid
          month={month}
          focused={focused}
          selected={value}
          today={current}
          min={min}
          max={max}
          onChoose={onChoose}
          onKeyDown={onDayKey}
        />
      ) : (
        <div
          className="grid min-h-[252px] grid-cols-3 gap-2"
          aria-label={view === 'years' ? '연도 선택' : '월 선택'}
        >
          {Array.from({ length: 12 }, (_, index) => {
            const optionYear = view === 'years' ? yearPage + index : year
            const optionMonth = view === 'months' ? index + 1 : monthNumber
            const date =
              String(optionYear).padStart(4, '0') +
              '-' +
              String(optionMonth).padStart(2, '0') +
              '-01'
            const selected = view === 'years' ? optionYear === year : optionMonth === monthNumber
            const enabled =
              view === 'years' ? yearAllowed(optionYear) : monthAllowed(date, min, max)
            return (
              <button
                key={index}
                type="button"
                disabled={!enabled}
                data-active={selected || undefined}
                onClick={() => {
                  setMonth(date)
                  if (view === 'years') setView('months')
                  else {
                    moveFocus(date)
                    setView('days')
                  }
                }}
                className={cn(
                  'rounded-xl text-xs transition-colors hover:bg-brand-soft hover:text-brand-ink disabled:opacity-25',
                  selected ? 'bg-brand-soft font-bold text-brand-ink' : 'text-secondary',
                )}
              >
                {view === 'years' ? optionYear + '년' : optionMonth + '월'}
              </button>
            )
          })}
        </div>
      )}
      <div className="mt-2 flex items-center justify-between border-t border-line pt-2 text-xs">
        <button
          type="button"
          disabled={!inRange(current, min, max)}
          onClick={() => onChoose(current)}
          className="rounded-lg px-3 py-2 font-medium text-brand-ink hover:bg-brand-soft"
        >
          오늘
        </button>
        {!required && (
          <button
            type="button"
            onClick={() => onChoose('')}
            className="rounded-lg px-3 py-2 text-muted hover:bg-canvas hover:text-ink"
          >
            선택 해제
          </button>
        )}
        {required && <span className="pr-2 text-[10px] text-muted">날짜를 선택해 주세요</span>}
      </div>
    </div>
  )
}
