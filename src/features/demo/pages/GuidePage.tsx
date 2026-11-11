import { Badge } from '@/shared/ui/feedback/Badge'
import { Card } from '@/shared/ui/layout/Card'
import { cn } from '@/shared/lib/cn'
import { Icon } from '@/shared/ui/actions/Icon'
import { PageHeader } from '@/shared/ui/layout/PageHeader'
import { GuideComparison } from '../components/GuideComparison'
import { GuideScope } from '../components/GuideScope'
import { GuideSection } from '../components/GuideSection'
import { GuideWalkthrough } from '../components/GuideWalkthrough'

export function GuidePage() {
  return (
    <>
      <PageHeader
        title="함께 검토할 첫 번째 워크스페이스"
        description="요구사항과 최신 DB 설계를 바탕으로, 실제 사용 흐름을 먼저 확인하는 프론트엔드 데모예요."
      />
      <Card
        as="section"
        className={cn(
          'bg-linear-to-br from-white to-brand-soft p-8 [&_h2]:mt-4 [&_h2]:text-[27px]',
          '[&_h2]:leading-relaxed [&_p]:mt-3 [&_p]:text-xs [&_p]:leading-loose [&_p]:text-muted',
        )}
      >
        <Badge tone="accent">FRONTEND PROTOTYPE</Badge>
        <h2>
          화면은 연결하고,
          <br />
          업무 규칙은 먼저 확인했어요.
        </h2>
        <p>
          실제 SQL의 가상 데이터로 시작해요. 직원 10명, 발주처 3곳, 프로젝트 4개,
          <br />
          참여 20건과 평가 34건이 서로 연결되어 있어요.
        </p>
        <div className="mt-7 flex gap-6 text-xs text-brand-ink [&_span]:flex [&_span]:items-center [&_span]:gap-2">
          <span>
            <Icon name="check" />
            브라우저 내 저장
          </span>
          <span>
            <Icon name="people" />
            역할별 화면
          </span>
          <span>
            <Icon name="download" />
            CSV 자료 추출
          </span>
        </div>
      </Card>
      <GuideWalkthrough />
      <div className="grid grid-cols-[1.45fr_1fr] gap-6 [&>section]:min-w-0">
        <GuideSection>
          <h2>이번 데모에 반영한 규칙</h2>
          <ul>
            <li>입사연도 + 연도별 4자리 순번으로 사번 자동 발급</li>
            <li>로그인 ID 중복 확인 · 가입 권한은 일반 직원으로 고정</li>
            <li>학력·총 경력·기술 설명·비밀번호만 본인 수정</li>
            <li>직군과 무관하게 모든 재직 직원의 프로젝트 참여 지원</li>
            <li>같은 프로젝트에 한 번만 참여 · 역할은 최초 등록 후 고정</li>
            <li>예정일을 넘겨도 실제 종료일까지 진행 중으로 처리</li>
            <li>종료 프로젝트에서만 평가 · 자기평가와 중복 제출 차단</li>
            <li>고객평가 실제 담당자와 시스템 등록 PM을 구분</li>
            <li>의뢰 → 전원 회수 → 회사 보고 순서와 날짜 검증</li>
          </ul>
        </GuideSection>
        <GuideSection>
          <h2>백엔드 연결이 필요한 부분</h2>
          <ul>
            <li>Spring Boot · Spring Data JPA · MySQL 실제 데이터 연동</li>
            <li>서버 로그인·세션 인증과 요청별 접근 권한 검사</li>
            <li>비밀번호의 서버 해시 저장과 주민등록번호 암호화</li>
            <li>동시 가입 시 사번·로그인 ID 중복 방지 트랜잭션</li>
            <li>평가 자격·투입기간·고객평가 중복의 서버 재검증</li>
            <li>권한별 조회 조건 적용과 개인정보 응답 최소화</li>
          </ul>
          <div className="my-5 flex items-center gap-2 rounded-xl bg-canvas px-4 py-3.5 text-xs leading-relaxed text-secondary">
            <Icon name="info" size={18} />
            계정 전환은 시연용이에요. 실제 인증이나 서버 보안을 구현한 상태는 아니에요.
          </div>
        </GuideSection>
      </div>
      <GuideComparison />
      <GuideScope />
    </>
  )
}
