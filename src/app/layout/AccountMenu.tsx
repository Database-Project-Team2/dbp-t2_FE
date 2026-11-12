import { cn } from '@/shared/lib/cn'
import { useEffect, useRef } from 'react'
import { Avatar } from '@/shared/ui/data/Avatar'
import { Icon } from '@/shared/ui/actions/Icon'
import { isManagement, isPM } from '@/shared/domain/permissions'
import { useStore } from '@/store/StoreContext'
import { go } from '../routing/navigation'

const itemClass = cn(
  'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[13px] text-secondary',
  'hover:bg-canvas hover:text-ink',
  'aria-[current=page]:bg-brand-soft aria-[current=page]:text-brand-ink',
)
export function AccountMenu({ route }: { route: string }) {
  const { db, user, switchUser } = useStore()
  const ref = useRef<HTMLDetailsElement>(null)
  const employee = user!
  const role = isManagement(employee)
    ? '경영진'
    : isPM(db, employee)
      ? '프로젝트 매니저'
      : '일반 직원'
  function closeMenu() {
    if (!ref.current) return
    ref.current.open = false
    ref.current.querySelector('summary')?.focus()
  }
  useEffect(() => {
    if (ref.current) ref.current.open = false
  }, [route])
  useEffect(() => {
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && ref.current && !ref.current.contains(event.target))
        ref.current.open = false
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape' && ref.current?.open) closeMenu()
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [])
  return (
    <details ref={ref} className="relative">
      <summary
        aria-label="계정 메뉴"
        className="flex items-center gap-2 rounded-lg py-2 pl-2 text-[13px] font-medium whitespace-nowrap"
      >
        <Avatar
          name={employee.employee_name}
          small
          className="rounded-full bg-canvas text-secondary"
        />
        <span>{employee.employee_name}</span>
        <Icon name="down" size={14} className="text-muted" />
      </summary>
      <div className="absolute top-[calc(100%+16px)] right-0 w-56 rounded-2xl border border-line bg-white p-2.5 shadow-floating">
        <div className="mb-1 flex items-center gap-2 border-b border-line px-3 pt-2.5 pb-4">
          <b>{employee.employee_name}</b>
          <span className="text-[11px] text-muted">{role}</span>
        </div>
        <a
          href="#/profile"
          onClick={closeMenu}
          className={itemClass}
          aria-current={route === 'profile' ? 'page' : undefined}
        >
          <Icon name="user" size={17} />내 프로필
        </a>
        <div className="mt-1 border-t border-line pt-1">
          <button
            className={itemClass}
            onClick={() => {
              closeMenu()
              switchUser(null)
              go('dashboard')
            }}
          >
            <Icon name="logout" size={17} />
            로그아웃
          </button>
        </div>
      </div>
    </details>
  )
}
