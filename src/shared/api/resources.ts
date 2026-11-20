import { api, type Query } from './client.ts'
import type {
  AssignmentView,
  ClientView,
  EmployeeDashboard,
  EmployeeListItem,
  ManagementDashboard,
  MemberView,
  ProjectDetail,
  ProjectListItem,
  ProjectStatus,
} from './types.ts'
import type { Employee } from '../model/entities.ts'

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
}

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
}
