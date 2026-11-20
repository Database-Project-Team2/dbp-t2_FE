import { request } from '@playwright/test'
import { API_BASE_URL } from './env'

/** 장면 1에서 가입하는 신규 직원. 이후 장면의 준비 데이터로도 사용합니다. */
export const NEWBIE = {
  employee_name: '한결',
  login_id: 'scene.newbie',
  password: 'Newbie1234!',
  resident_no: '000229-3000000',
  education: '대졸(학사)',
  total_career_months: 6,
  job_category: 'DEVELOPER',
  skill_description: 'React, TypeScript, SQL',
}

/** 이전 장면을 거치지 않고 실행할 때 API로 같은 상태를 만듭니다. */
export async function apiContext(token?: string) {
  return request.newContext({
    baseURL: `${API_BASE_URL}/api/v1/`,
    extraHTTPHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export async function apiLogin(loginId: string, password = 'demo1234') {
  const context = await apiContext()
  const response = await context.post('auth/login', { data: { login_id: loginId, password } })
  const body = await response.json()
  await context.dispose()
  return body.data.access_token as string
}

/** 장면 1의 신규 직원을 API로 가입시킵니다(입사일 오늘). */
export async function registerNewbie(hireDate: string) {
  const context = await apiContext()
  const response = await context.post('employees', { data: { ...NEWBIE, hire_date: hireDate } })
  if (response.status() !== 201) throw new Error(`신규 직원 가입 실패: ${await response.text()}`)
  const body = await response.json()
  await context.dispose()
  return body.data.employee.employee_id as number
}

export const NEW_PROJECT = '새봄 학습관리 시스템'
