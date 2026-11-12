import { type ReactNode, useRef, useId, useEffect } from 'react'
import { Button } from '../actions/Button'
import { cn } from '../../lib/cn'
import { Icon } from '../actions/Icon'

export function Modal({
  title,
  subtitle,
  children,
  onClose,
  wide = false,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  onClose: () => void
  wide?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const heading = useId()
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])
  useEffect(() => {
    const dialog = ref.current!
    const active = document.activeElement as HTMLElement | null
    dialog.showModal()
    const cancel = (e: Event) => {
      e.preventDefault()
      closeRef.current()
    }
    dialog.addEventListener('cancel', cancel)
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.removeEventListener('cancel', cancel)
      dialog.close()
      document.body.style.overflow = oldOverflow
      active?.focus()
    }
  }, [])
  return (
    <dialog
      ref={ref}
      className={cn(
        'm-auto max-h-[90vh] max-w-[calc(100vw-32px)] overflow-hidden rounded-[20px] border-0 bg-white p-0 text-ink shadow-dialog',
        'backdrop:bg-ink/35 backdrop:backdrop-blur-sm',
        wide ? 'w-[720px]' : 'w-[540px]',
      )}
      aria-labelledby={heading}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const box = e.currentTarget.getBoundingClientRect()
          if (
            e.clientX < box.left ||
            e.clientX > box.right ||
            e.clientY < box.top ||
            e.clientY > box.bottom
          )
            onClose()
        }
      }}
    >
      <div className="max-h-[90vh] overflow-y-auto overscroll-contain p-7">
        <div className="mb-6 flex items-start justify-between gap-4 [&_h2]:text-[21px] [&_p]:mt-2 [&_p]:text-xs [&_p]:text-muted">
          <div>
            <h2 id={heading}>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <Button variant="icon" size="icon" onClick={onClose} aria-label="닫기">
            <Icon name="close" />
          </Button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
