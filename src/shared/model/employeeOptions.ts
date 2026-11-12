import type { SystemRole } from './entities.ts'

export const ACCOUNT_ROLES: Record<SystemRole, string> = {
  MANAGEMENT: '경영진',
  PM: 'PM',
  EMPLOYEE: '일반 직원',
}

export const EDUCATIONS = ['고졸', '전문대졸(초대졸)', '대졸(학사)', '석사', '박사'] as const

export function normalizeEducation(education: string) {
  const aliases: Record<string, string> = {
    '고등학교 졸업': '고졸',
    '전문대 졸업': '전문대졸(초대졸)',
    '전문대학교 졸업': '전문대졸(초대졸)',
    '대학교 졸업': '대졸(학사)',
    '대학 졸업': '대졸(학사)',
    '석사 졸업': '석사',
    '박사 졸업': '박사',
  }
  return aliases[education] || education
}
