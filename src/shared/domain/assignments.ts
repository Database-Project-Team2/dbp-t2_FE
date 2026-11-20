import { isManagement } from './permissions.ts'
import type { Employee, Member } from '../model/entities.ts'

export const canRemoveMember = (user: Employee, member: Member) =>
  isManagement(user) && member.assignment_start_date === null && member.assignment_end_date === null
