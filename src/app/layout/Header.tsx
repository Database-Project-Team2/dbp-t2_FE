import { BrandLogo } from '@/shared/ui/brand/BrandLogo'
import { Button } from '@/shared/ui/actions/Button'
import { cn } from '@/shared/lib/cn'
import { Icon } from '@/shared/ui/actions/Icon'
import { isManagement } from '@/shared/domain/permissions'
import { useStore } from '@/store/StoreContext'
import { AccountMenu } from './AccountMenu'
import { navigation } from '../routing/navigation'

interface HeaderProps {
  route: string
  onSearch: () => void
  onDemoSettings: () => void
}
export function Header({ route, onSearch, onDemoSettings }: HeaderProps) {
  const { user } = useStore()
  const page = route.split('/')[0]
  const items = navigation.filter(
    (item) => isManagement(user!) || !['people', 'clients'].includes(item.id),
  )
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[84px] max-w-[1320px] items-center gap-8 px-8">
        <BrandLogo className="w-[142px]" />
        <nav aria-label="주 메뉴" className="flex self-stretch">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#/${item.id}`}
              aria-current={page === item.id ? 'page' : undefined}
              className={cn(
                'relative flex items-center px-4 text-[13px] font-medium whitespace-nowrap text-secondary hover:text-brand-ink',
                page === item.id &&
                  'font-bold text-brand after:absolute after:inset-x-4 after:bottom-0 after:h-[3px] after:rounded-t after:bg-brand',
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <Button
            variant="icon"
            size="icon"
            onClick={onSearch}
            aria-label="프로젝트 빠른 검색"
            title="프로젝트 검색"
          >
            <Icon name="search" />
          </Button>
          <AccountMenu route={route} onDemoSettings={onDemoSettings} />
        </div>
      </div>
    </header>
  )
}
