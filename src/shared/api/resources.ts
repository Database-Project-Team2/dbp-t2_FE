import { api, type Query } from './client.ts'
import type {
  AssignmentView,
  EligibleProject,
  EvaluationOptions,
  EvaluationView,
  MemberCandidate,
  ClientView,
  EmployeeDashboard,
  EmployeeListItem,
  ManagementDashboard,
  MemberView,
  ProjectDetail,
  ProjectListItem,
  ProjectStatus,
} from './types.ts'
import type { Client, Employee, EvaluationType, ProjectRole } from '../model/entities.ts'

/** 페이지 UI가 없는 목록은 한 번에 최대치(100건)를 받습니다. */
export const LIST_SIZE = 100

export const dashboardApi = {
  get: (asOf?: string) =>
    api.get<ManagementDashboard | EmployeeDashboard>('/dashboard', { as_of: asOf }),
}

export const projectsApi = {
  list: async (query: Query = {}) => {
    const response = await api.page<ProjectListItem>('/projects', { size: LIST_SIZE, ...query })
    return response as typeof response & { status_counts: Record<ProjectStatus, number> }
  },
  detail: (projectId: number) => api.get<ProjectDetail>(`/projects/${projectId}`),
  members: (projectId: number, asOf?: string) =>
    api.get<MemberView[]>(`/projects/${projectId}/members`, { as_of: asOf }),
  create: (input: ProjectInput) => api.post<ProjectDetail>('/projects', input),
  update: (projectId: number, input: Partial<ProjectInput>) =>
    api.patch<ProjectDetail>(`/projects/${projectId}`, input),
  close: (projectId: number, actualEndDate: string) =>
    api.post<{ project: ProjectDetail; closed_member_ids: number[] }>(
      `/projects/${projectId}/close`,
      { actual_end_date: actualEndDate },
    ),
  clientOptions: (projectId: number) =>
    api.get<{ client_id: number; client_name: string }[]>(`/projects/${projectId}/client-options`),
  candidates: (projectId: number, query: Query = {}) =>
    api.page<MemberCandidate>(`/projects/${projectId}/member-candidates`, {
      size: LIST_SIZE,
      ...query,
    }),
  addMember: (projectId: number, input: MemberInput) =>
    api.post<MemberView>(`/projects/${projectId}/members`, input),
  recordWorkflow: (projectId: number, step: WorkflowStep, processedDate: string) =>
    api.patch<unknown>(`/projects/${projectId}/customer-evaluation`, {
      step,
      processed_date: processedDate,
    }),
  evaluationOptions: (projectId: number, type: EvaluationType) =>
    api.get<EvaluationOptions>(`/projects/${projectId}/evaluation-options`, {
      evaluation_type: type,
    }),
}

export type WorkflowStep = 'REQUEST' | 'RECEIVE' | 'REPORT'

export interface EvaluationInput {
  target_member_id: number
  evaluation_type: EvaluationType
  evaluated_date: string
  work_performance_score: number
  work_performance_comment: string
  communication_score: number
  communication_comment: string
}

export const evaluationsApi = {
  eligible: () => api.get<EligibleProject[]>('/evaluations/eligible-projects'),
  create: (input: EvaluationInput) => api.post<{ evaluation_id: number }>('/evaluations', input),
  search: (query: Query = {}) =>
    api.page<EvaluationView>('/evaluations', { size: LIST_SIZE, ...query }),
  detail: (evaluationId: number) => api.get<EvaluationView>(`/evaluations/${evaluationId}`),
  /** 목록과 같은 조건·권한의 전체 결과 CSV(page/size 없음). */
  exportCsv: (query: Query = {}) => api.file('/evaluations/export.csv', query),
}

export interface ProjectInput {
  project_name: string
  client_id: number
  actual_start_date: string
  planned_end_date: string
}

export interface MemberInput {
  employee_id: number
  project_role: ProjectRole
  assignment_start_date: string | null
  assignment_end_date: string | null
}

export const membersApi = {
  changeAssignment: (
    memberId: number,
    input: { assignment_start_date?: string | null; assignment_end_date?: string | null },
  ) => api.patch<MemberView>(`/members/${memberId}/assignment`, input),
  remove: (memberId: number) => api.delete(`/members/${memberId}`),
}

export type ClientInput = Omit<Client, 'client_id'>

export const employeesApi = {
  search: (query: Query = {}) =>
    api.page<EmployeeListItem>('/employees', { size: LIST_SIZE, ...query }),
  detail: (employeeId: number) => api.get<Employee>(`/employees/${employeeId}`),
}

export const assignmentsApi = {
  search: (query: Query = {}) =>
    api.page<AssignmentView>('/assignments', { size: LIST_SIZE, ...query }),
}

export const clientsApi = {
  search: (query: Query = {}) => api.page<ClientView>('/clients', { size: LIST_SIZE, ...query }),
  detail: (clientId: number) => api.get<ClientView>(`/clients/${clientId}`),
  create: (input: ClientInput) => api.post<ClientView>('/clients', input),
  update: (clientId: number, input: Partial<ClientInput>) =>
    api.patch<ClientView>(`/clients/${clientId}`, input),
}
