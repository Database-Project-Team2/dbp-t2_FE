import type { Employee } from '../model/entities.ts'

export const isManagement = (employee: Employee) => employee.system_role === 'MANAGEMENT'
export const canAccessPage = (user: Employee, page: string) =>
  isManagement(user) || !['people', 'history'].includes(page)
