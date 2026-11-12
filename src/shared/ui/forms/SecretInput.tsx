import { useId, useState, type ComponentPropsWithRef } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from '../actions/Icon'
import { controlStyles } from './controlStyles'

type SecretInputProps = Omit<ComponentPropsWithRef<'input'>, 'type'> & {
  label: string
}

/** 각 입력칸이 독립적으로 표시 여부를 관리하며, 처음에는 항상 숨깁니다. */
export function SecretInput({ label, id, className, disabled, ...props }: SecretInputProps) {
  const generatedId = useId()
  const inputId = id || generatedId
  const [visible, setVisible] = useState(false)
  const toggleLabel = `${label} ${visible ? '숨기기' : '보기'}`

  return (
    <div className="relative w-full min-w-0">
      <input
        {...props}
        id={inputId}
        type={visible ? 'text' : 'password'}
        disabled={disabled}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        className={cn(controlStyles, 'w-full pr-11', className)}
      />
      <button
        type="button"
        aria-label={toggleLabel}
        aria-controls={inputId}
        aria-pressed={visible}
        title={toggleLabel}
        disabled={disabled}
        onClick={() => setVisible((previous) => !previous)}
        className="absolute inset-y-1 right-1 flex w-9 items-center justify-center rounded-md text-muted hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50"
      >
        <Icon name={visible ? 'eyeOff' : 'eye'} size={18} />
      </button>
    </div>
  )
}
