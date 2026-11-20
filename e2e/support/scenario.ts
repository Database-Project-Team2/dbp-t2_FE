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

/** 장면 3 종료 상태를 API로 만듭니다: 새 프로젝트(새봄교육, 오늘 착수) + 박지훈 PM + 신규 직원 프로그래머, 오늘 종료. */
export async function prepareClosedNewProject(today: string) {
  const newbieId = await registerNewbie(today)
  const manager = await apiContext(await apiLogin('demo01'))
  const created = await manager.post('projects', {
    data: {
      project_name: NEW_PROJECT,
      client_id: 3,
      actual_start_date: today,
      planned_end_date: today,
    },
  })
  const projectId = (await created.json()).data.project_id as number
  const pm = await manager.post(`projects/${projectId}/members`, {
    data: { employee_id: 3, project_role: 'PM', assignment_start_date: today },
  })
  const newbie = await manager.post(`projects/${projectId}/members`, {
    data: { employee_id: newbieId, project_role: 'PROGRAMMER', assignment_start_date: today },
  })
  const pmMemberId = (await pm.json()).data.member_id as number
  const newbieMemberId = (await newbie.json()).data.member_id as number
  const closed = await manager.post(`projects/${projectId}/close`, {
    data: { actual_end_date: today },
  })
  if (closed.status() !== 200) throw new Error(`준비 실패: ${await closed.text()}`)
  await manager.dispose()
  return { projectId, newbieId, pmMemberId, newbieMemberId }
}
