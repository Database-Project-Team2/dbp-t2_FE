import { Icon } from '@/shared/ui/actions/Icon'
import { GuideSection } from './GuideSection'

export function GuideScope() {
  return (
    <GuideSection>
      <h2>최신 시트에서 확정한 범위</h2>
      <p>
        동일 프로젝트 재투입·계획 투입기간·고객 담당자 변경 이력은 범위에서 제외해요. 일반 직원은
        실제 투입 시작일이 기록된 본인 프로젝트와 이력만 조회하고, 평가 결과 검색은 경영진과 본인
        등록 평가를 보는 PM에게만 허용해요.
      </p>
      <p>
        이번 데모에서는 신규 투입은 재직자만 허용하고, PM·경영진이 프로젝트 구성원을 관리해요.
        프로젝트 종료 시 진행 중인 투입을 함께 종료하며, 고객평가는 의뢰일 이후에만 등록하도록
        가정했어요. 세부 가정과 API 제안은 저장소의 docs에 정리되어 있어요.
      </p>
      <div className="my-5 flex items-center gap-2 rounded-xl bg-canvas px-4 py-3.5 text-xs leading-relaxed text-secondary">
        <Icon name="info" size={18} />
        과제는 관계형 DB와 연동 계층 사용을 필수로 요구해요. 이 데모만으로 DB 연동·최종 제출
        요구사항이 완료되지는 않아요.
      </div>
    </GuideSection>
  )
}
