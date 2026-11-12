import {
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type SelectHTMLAttributes,
} from 'react'
import { cn } from '../../lib/cn'
import { Icon } from '../actions/Icon'
import { usePopover } from '../overlays/usePopover'
import { controlStyles } from './controlStyles'
import { FieldContext, useFieldControl } from './FieldContext'
import { selectOptions } from './select/selectOptions'
import { SelectList } from './select/SelectList'
import { useSelectKeyboard } from './select/useSelectKeyboard'

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onBlur' | 'multiple' | 'size'> & {
  onBlur?: () => void
}

export function Select({
  children,
  className,
  id,
  value,
  disabled,
  required,
  onBlur,
  ...props
}: SelectProps) {
  const field = useContext(FieldContext)
  const control = useFieldControl({ ...props, id })
  const generatedId = useId()
  const inputId = control.id || generatedId
  const selectRef = useRef<HTMLSelectElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const { id: popoverId, open, anchorRef, panelProps, show, hide } = usePopover()
  const options = selectOptions(children)
  const selectedValue = String(value ?? options[0]?.value ?? '')
  const selected = options.find((option) => option.value === selectedValue)
  const initial = options.findIndex((option) => option.value === selectedValue && !option.disabled)
  const firstEnabled = options.findIndex((option) => !option.disabled)
  const [active, setActive] = useState(initial >= 0 ? initial : firstEnabled)
  const [invalid, setInvalid] = useState(false)
  const activeIndex = options[active] && !options[active].disabled ? active : firstEnabled
  function choose(index: number) {
    if (!options[index] || options[index].disabled) return
    const select = selectRef.current!
    select.value = options[index].value
    select.dispatchEvent(new Event('change', { bubbles: true }))
    setInvalid(false)
    hide()
    triggerRef.current?.focus()
  }
  const onKeyDown = useSelectKeyboard(
    options,
    open,
    open ? activeIndex : initial >= 0 ? initial : firstEnabled,
    setActive,
    show,
    hide,
    choose,
  )
  useLayoutEffect(() => {
    if (open)
      document
        .getElementById(popoverId + '-option-' + activeIndex)
        ?.scrollIntoView({ block: 'nearest' })
  }, [open, popoverId, activeIndex])
  return (
    <div
      ref={anchorRef}
      className={cn('relative min-w-0', field ? 'w-full' : 'inline-block min-w-[160px]')}
    >
      <select
        {...props}
        ref={selectRef}
        value={value}
        disabled={disabled}
        required={required}
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none absolute size-px opacity-0"
        onInvalid={(event) => {
          event.preventDefault()
          setInvalid(true)
          triggerRef.current?.focus()
          show()
        }}
      >
        {children}
      </select>
      <button
        ref={triggerRef}
        id={inputId}
        type="button"
        role="combobox"
        disabled={disabled}
        aria-label={props['aria-label']}
        aria-labelledby={control['aria-labelledby']}
        aria-describedby={props['aria-describedby']}
        aria-invalid={props['aria-invalid'] || invalid}
        aria-required={required}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={popoverId}
        aria-activedescendant={
          open && activeIndex >= 0 ? popoverId + '-option-' + activeIndex : undefined
        }
        popoverTarget={popoverId}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onClick={() => setActive(initial >= 0 ? initial : firstEnabled)}
        className={cn(
          controlStyles,
          'flex min-h-[42px] w-full items-center justify-between gap-4 text-left',
          className,
        )}
      >
        <span className={cn('truncate', (!selected || selected.disabled) && 'text-muted')}>
          {selected?.label || '선택해 주세요'}
        </span>
        <Icon
          name="down"
          size={16}
          className={cn('text-muted transition-transform', open && 'rotate-180 text-brand')}
        />
      </button>
      {invalid && !selectedValue && (
        <p className="mt-2 text-[11px] text-brand">항목을 선택해 주세요.</p>
      )}
      <div
        {...panelProps}
        role="listbox"
        aria-label={props['aria-label'] || field?.label || '선택 항목'}
      >
        <SelectList
          options={options}
          active={activeIndex}
          value={selectedValue}
          id={popoverId}
          onActive={setActive}
          onChoose={choose}
        />
      </div>
    </div>
  )
}
