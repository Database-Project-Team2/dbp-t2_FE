import { Button } from '@/shared/ui/actions/Button'
import { Card } from '@/shared/ui/layout/Card'
import { cn } from '@/shared/lib/cn'
import { go } from '@/app/routing/navigation'
import { Icon } from '@/shared/ui/actions/Icon'
import { SectionHeading } from '@/shared/ui/layout/SectionHeading'

const steps = [
  [
    '01',
    '경영진으로 현황 살펴보기',
    '업무 현황에서 기준일을 2026-08-15로 바꿔 보세요. 그날 투입된 직원과 프로젝트가 함께 바뀌어요.',
    'dashboard',
  ],
  [
    '02',
    '프로젝트와 구성원 등록하기',
    '프로젝트를 등록한 뒤 구성원을 추가하세요. 같은 직원의 중복 등록과 고정 역할 변경은 제한돼요.',
    'projects',
  ],
  [
    '03',
    'PM으로 고객평가 마무리하기',
    '헤더 계정 메뉴 → 데모 설정에서 정도윤 PM으로 전환하세요. 연구 데이터 관리 시스템의 남은 고객평가 3건을 등록한 뒤 전체 회수와 회사 보고를 기록할 수 있어요.',
    'evaluations',
  ],
  [
    '04',
    '직원 관점으로 비교하기',
    '이서연 직원으로 전환하면 내 참여 프로젝트와 이력만 조회돼요. 종료 프로젝트의 동료평가와 프로필 수정도 체험해 보세요.',
    'profile',
  ],
  [
    '05',
    '회원가입과 사번 발급 확인하기',
    '로그아웃 후 회원가입에서 demo01 중복 오류를 확인하고, 새로운 ID로 가입해 자동 발급된 사번을 확인하세요.',
    'profile',
  ],
]

export function GuideWalkthrough() {
  return (
    <Card as="section">
      <SectionHeading>
        <h2>5분 시연 순서</h2>
      </SectionHeading>
      <div
        className={cn(
          'px-6 pb-4 [&_h3]:text-sm [&_p]:mt-2 [&_p]:text-xs [&_p]:text-muted [&>div]:flex',
          '[&>div]:items-center [&>div]:gap-5 [&>div]:border-b [&>div]:border-line [&>div]:py-6',
          '[&>div:last-child]:border-b-0 [&>div>div]:flex-1 [&>div>span]:text-xl',
          '[&>div>span]:font-bold [&>div>span]:text-brand-line',
        )}
      >
        {steps.map(([n, title, body, path]) => (
          <div key={n}>
            <span>{n}</span>
            <div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
            <Button
              variant="icon"
              size="icon"
              aria-label={`${title} 화면 열기`}
              onClick={() => go(path)}
            >
              <Icon name="arrow" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
