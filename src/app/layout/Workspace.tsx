import { useEffect, useState } from 'react'
import { AuthPage } from '@/features/auth/pages/AuthPage'
import { cn } from '@/shared/lib/cn'
import { DemoSettingsDialog } from '@/features/demo/components/DemoSettingsDialog'
import { Icon } from '@/shared/ui/actions/Icon'
import { useStore } from '@/store/StoreContext'
import { AppRoutes } from '../routing/AppRoutes'
import { Header } from './Header'
import { QuickSearchDialog } from '../components/QuickSearchDialog'
import { useHashRoute } from '../routing/useHashRoute'

/** 공통 레이아웃만 담당합니다. 개별 화면 선택은 AppRoutes에서 확인하세요. */
export function Workspace() {
  const { user } = useStore()
  const route = useHashRoute()
  const [notice, setNotice] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(''), 4500)
    return () => clearTimeout(timer)
  }, [notice])

  if (!user) return <AuthPage onNotice={setNotice} />

  return (
    <div className="min-h-screen">
      <a
        className="fixed -top-20 left-6 z-50 rounded-lg bg-brand px-5 py-3 text-white focus:top-3"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
      >
        본문 바로가기
      </a>
      <Header
        route={route}
        onSearch={() => setSearchOpen(true)}
        onDemoSettings={() => setDemoOpen(true)}
      />
      <div className="w-full">
        <main
          className="mx-auto w-full max-w-[1320px] px-10 pt-10"
          id="main-content"
          key={user.employee_id}
          tabIndex={-1}
        >
          <AppRoutes route={route} onNotice={setNotice} />
          <footer className="mt-10 flex justify-between gap-4 py-6 text-[10px] text-muted">
            <span>© 2026 프람트테크놀로지</span>
            <span>팀 2 · 가상 데이터로 체험 중</span>
          </footer>
        </main>
      </div>
      {notice && (
        <div
          className={cn(
            'fixed bottom-8 left-1/2 z-50 flex w-max max-w-[90vw] -translate-x-1/2 items-center gap-3',
            'rounded-xl bg-ink/95 px-5 py-4 text-xs text-white shadow-floating [&>button]:ml-2',
            '[&>span]:text-emerald-300',
          )}
          role="status"
        >
          <span>✓</span>
          {notice}
          <button onClick={() => setNotice('')} aria-label="알림 닫기">
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      {demoOpen && <DemoSettingsDialog onClose={() => setDemoOpen(false)} onNotice={setNotice} />}
      {searchOpen && <QuickSearchDialog onClose={() => setSearchOpen(false)} />}
    </div>
  )
}
