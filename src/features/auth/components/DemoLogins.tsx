import { Button } from '@/shared/ui/actions/Button'
import { go } from '@/app/routing/navigation'
import { useStore } from '@/store/StoreContext'

const accounts = [
  { id: 1, label: '경영진' },
  { id: 5, label: 'PM' },
  { id: 2, label: '일반 직원' },
]
export function DemoLogins() {
  const { switchUser } = useStore()
  return (
    <div className="border-t border-line pt-6 text-center">
      <span className="text-xs text-muted">팀원들과 빠르게 둘러보기</span>
      <div className="my-4 flex justify-center gap-2">
        {accounts.map((account) => (
          <Button
            variant="secondary"
            size="small"
            key={account.id}
            onClick={() => {
              switchUser(account.id)
              go('dashboard')
            }}
          >
            {account.label} 체험
          </Button>
        ))}
      </div>
      <small className="text-[11px] text-muted">샘플 로그인: demo01 / demo1234</small>
    </div>
  )
}
