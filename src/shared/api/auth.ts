import { api } from './client.ts'
import type { Employee, Job } from '../model/entities.ts'

export interface Session {
  employee: Employee
  is_pm: boolean
  server_today: string
}

export interface TokenSession extends Session {
  access_token: string
}

export interface RegistrationRequest {
  employee_name: string
  login_id: string
  password: string
  resident_no: string
  education: string
  hire_date: string
  total_career_months: number
  job_category: Job
  skill_description: string | null
}

export const authApi = {
  login: (loginId: string, password: string) =>
    api.post<TokenSession>(
      '/auth/login',
      { login_id: loginId, password },
      { skipUnauthorizedRedirect: true },
    ),
  register: (input: RegistrationRequest) => api.post<TokenSession>('/employees', input),
  me: () => api.get<Session>('/auth/me'),
  logout: () => api.post<void>('/auth/logout'),
  checkLoginId: (loginId: string) =>
    api.get<{ login_id: string; available: boolean }>('/auth/check-login-id', {
      login_id: loginId,
    }),
}
