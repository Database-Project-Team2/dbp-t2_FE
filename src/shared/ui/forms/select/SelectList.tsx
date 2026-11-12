import { cn } from '../../../lib/cn'
import type { SelectOption } from './selectOptions'

export function SelectList({
  options,
  active,
  value,
  id,
  onActive,
  onChoose,
}: {
  options: SelectOption[]
  active: number
  value: string
  id: string
  onActive: (index: number) => void
  onChoose: (index: number) => void
}) {
  return (
    <div className="max-h-64 overflow-auto p-0.5">
      {options.map((option, index) => (
        <div
          key={option.value}
          id={id + '-option-' + index}
          role="option"
          aria-selected={option.value === value}
          aria-disabled={option.disabled}
          onPointerMove={() => !option.disabled && onActive(index)}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => !option.disabled && onChoose(index)}
          className={cn(
            'flex min-h-10 cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-[13px] leading-relaxed',
            option.disabled
              ? 'cursor-default text-muted/60'
              : active === index
                ? 'bg-brand-soft text-brand-ink'
                : 'text-secondary',
            option.value === value && !option.disabled && 'font-semibold text-brand-ink',
          )}
        >
          <span>{option.label}</span>
          {option.value === value && !option.disabled && (
            <span aria-hidden="true" className="text-brand">
              ✓
            </span>
          )}
        </div>
      ))}
      {!options.length && <p className="px-3 py-4 text-xs text-muted">선택할 항목이 없어요.</p>}
    </div>
  )
}
