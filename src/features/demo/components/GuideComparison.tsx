import { Table } from '@/shared/ui/data/Table'
import { GuideSection } from './GuideSection'

export function GuideComparison() {
  return (
    <GuideSection>
      <h2>문서 간 차이는 이렇게 정리했어요</h2>
      <p>
        첨부한 초기 요구사항·10월 발표·HWP와 달라진 내용은 최신 공유 시트의 가정사항 20개·요구사항
        32개·ERD 셀 메모를 대조했어요. 최신 시트와 중간발표·ERD v1.5·생성 SQL은 5개 테이블 설계로
        일치해요.
      </p>
      <div className="overflow-auto">
        <Table>
          <thead>
            <tr>
              <th>항목</th>
              <th>초기 자료</th>
              <th>이번 구현 기준</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>재투입</td>
              <td>여러 투입기간 관리</td>
              <td>한 프로젝트에 한 번의 연속 투입</td>
            </tr>
            <tr>
              <td>기술·경험</td>
              <td>기술 목록과 연결 테이블</td>
              <td>직원의 자유 텍스트 · 키워드 AND 검색</td>
            </tr>
            <tr>
              <td>평가 저장</td>
              <td>임시저장 / 제출</td>
              <td>두 점수와 의견을 모두 갖춘 평가만 저장</td>
            </tr>
            <tr>
              <td>프로젝트 등록</td>
              <td>예정 프로젝트·투입 계획</td>
              <td>실제 착수한 프로젝트 · 실제 투입기간</td>
            </tr>
            <tr>
              <td>고객 담당자</td>
              <td>별도 담당자·의뢰 이력</td>
              <td>현재 대표 담당자 한 명 · 프로젝트에 날짜 기록</td>
            </tr>
            <tr>
              <td>날짜 컬럼</td>
              <td>표준용어 일부 _ON 표기</td>
              <td>ERD·SQL의 _date 명칭 사용</td>
            </tr>
            <tr>
              <td>직군</td>
              <td>개발자만 프로젝트 참여</td>
              <td>최신 테이블 정의서에 따라 모든 직군 허용</td>
            </tr>
          </tbody>
        </Table>
      </div>
    </GuideSection>
  )
}
