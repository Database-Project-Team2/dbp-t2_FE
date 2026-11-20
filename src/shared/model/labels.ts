import type { Job, ProjectRole, EvaluationType } from './entities'
import type { AssignmentStatus, ProjectStatus, WorkflowStatus } from '../api/types'

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

export const PROJECT_STATUS: Record<ProjectStatus, string> = {
  NOT_STARTED: '착수 전',
  IN_PROGRESS: '진행 중',
  CLOSED: '종료',
}

export const WORKFLOW: Record<WorkflowStatus, string> = {
  NOT_REQUESTED: '의뢰 전',
  COLLECTING: '회수 중',
  AWAITING_REPORT: '보고 대기',
  REPORTED: '보고 완료',
}

export const ASSIGNMENT: Record<AssignmentStatus, string> = {
  NOT_ASSIGNED: '투입 전',
  ASSIGNED: '투입 중',
  ENDED: '투입 종료',
}
