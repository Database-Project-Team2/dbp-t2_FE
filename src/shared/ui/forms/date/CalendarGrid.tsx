import type { KeyboardEvent } from 'react'
import { cn } from '../../../lib/cn'
import { calendarDays, inRange, parseDate } from './calendarDates'
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export function CalendarGrid({
  month,
  focused,
  selected,
  today,
  min,
  max,
  onChoose,
  onKeyDown,
}: {
  month: string
  focused: string
  selected: string
  today: string
  min: string
  max: string
  onChoose: (value: string) => void
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, date: string) => void
}) {
  const days = calendarDays(month)
  return (
    <div
      role="grid"
      aria-label={Number(month.slice(0, 4)) + '년 ' + Number(month.slice(5, 7)) + '월'}
    >
      <div role="row" className="mb-1 grid grid-cols-7">
        {WEEKDAYS.map((day, index) => (
          <span
            role="columnheader"
            key={day}
            className={cn(
              'py-2 text-center text-[11px] font-medium',
              index === 0 ? 'text-brand/70' : 'text-muted',
            )}
          >
            {day}
          </span>
        ))}
      </div>
      {Array.from({ length: 6 }, (_, week) => (
        <div key={week} role="row" className="grid grid-cols-7 gap-y-1">
          {days.slice(week * 7, week * 7 + 7).map((date) => {
            const outside = date.slice(0, 7) !== month.slice(0, 7)
            return (
              <button
                key={date}
                type="button"
                role="gridcell"
                aria-label={date}
                aria-selected={date === selected}
                aria-current={date === today ? 'date' : undefined}
                disabled={!inRange(date, min, max)}
                tabIndex={date === focused ? 0 : -1}
                data-active={date === focused || undefined}
                onClick={() => onChoose(date)}
                onKeyDown={(event) => onKeyDown(event, date)}
                className={cn(
                  'relative mx-auto flex size-9 items-center justify-center rounded-xl text-xs transition-colors disabled:opacity-25',
                  date === selected
                    ? 'bg-brand font-bold text-white shadow-sm'
                    : 'hover:bg-brand-soft hover:text-brand-ink',
                  date !== selected &&
                    (outside
                      ? 'text-muted/50'
                      : parseDate(date).getUTCDay() === 0
                        ? 'text-brand-ink'
                        : 'text-secondary'),
                  date === today &&
                    date !== selected &&
                    'font-bold after:absolute after:bottom-1 after:size-1 after:rounded-full after:bg-brand',
                )}
              >
                {Number(date.slice(8, 10))}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
