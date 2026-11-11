import type { Job, ProjectRole, EvaluationType } from './entities'

export const JOBS: Record<Job, string> = {
  DEVELOPER: '개발',
  MARKETING: '마케팅',
  BUSINESS_ADMIN: '경영관리',
  RESEARCH: '연구개발',
}

export const ROLES: Record<ProjectRole, string> = {
  PM: 'PM',
  PL: 'PL',
  ANALYST: '분석가',
  DESIGNER: '설계자',
  PROGRAMMER: '프로그래머',
  TESTER: '테스터',
}

export const EVAL_TYPES: Record<EvaluationType, string> = {
  CLIENT: '고객평가',
  PM: 'PM 평가',
  PEER: '동료평가',
}

export const EMPLOYMENT = { ACTIVE: '재직', ON_LEAVE: '휴직', RESIGNED: '퇴사' }
