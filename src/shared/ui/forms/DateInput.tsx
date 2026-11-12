import { useContext, useEffect, useId, useRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from '../actions/Icon'
import { usePopover } from '../overlays/usePopover'
import { FieldContext, useFieldControl } from './FieldContext'
import { controlStyles } from './controlStyles'
import { Calendar } from './date/Calendar'
import { dateError, isDate } from './date/calendarDates'

type DateInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'min' | 'max' | 'onChange' | 'onInput'
> & {
  value: string
  min?: string
  max?: string
  onValueChange: (value: string) => void
}
export function DateInput({
  value,
  min: minValue = '',
  max: maxValue = '',
  onValueChange,
  className,
  id,
  disabled,
  readOnly,
  required,
  ...props
}: DateInputProps) {
  const min = isDate(minValue) ? minValue : ''
  const max = isDate(maxValue) ? maxValue : ''
  const field = useContext(FieldContext)
  const control = useFieldControl({ ...props, id })
  const generatedId = useId()
  const inputId = control.id || generatedId
  const inputRef = useRef<HTMLInputElement>(null)
  const { id: popoverId, open, anchorRef, panelProps, show, hide } = usePopover(316)
  const label = props['aria-label'] || field?.label || '날짜'
  useEffect(() => {
    inputRef.current?.setCustomValidity(dateError(value, min, max))
  }, [value, min, max])
  function choose(next: string) {
    onValueChange(next)
    hide()
    inputRef.current?.focus()
  }
  return (
    <div ref={anchorRef} className={cn('relative min-w-0', field ? 'w-full' : 'inline-block')}>
      <input
        {...props}
        {...control}
        ref={inputRef}
        id={inputId}
        type="text"
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        inputMode="numeric"
        maxLength={10}
        placeholder="YYYY-MM-DD"
        autoComplete="off"
        pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={(event) => {
          props.onKeyDown?.(event)
          if (!event.defaultPrevented && event.key === 'ArrowDown' && !disabled && !readOnly) {
            event.preventDefault()
            show()
          }
        }}
        className={cn(controlStyles, 'w-full min-w-[145px] pr-10 tabular-nums', className)}
      />
      <button
        type="button"
        popoverTarget={popoverId}
        disabled={disabled || readOnly}
        aria-label={label + ' 달력 열기'}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={popoverId}
        className="absolute top-1 right-1 flex size-8 items-center justify-center rounded-md text-muted hover:bg-brand-soft hover:text-brand-ink"
      >
        <Icon name="calendar" size={17} />
      </button>
      <div {...panelProps} role="dialog" aria-label={label + ' 날짜 선택'}>
        {open && (
          <Calendar value={value} min={min} max={max} required={required} onChoose={choose} />
        )}
      </div>
    </div>
  )
}
