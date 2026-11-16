import type { Database, Employee } from '../../../shared/model/entities.ts'
import { isPM } from '../../../shared/domain/permissions.ts'
import { projectStatus } from '../../../shared/domain/projects.ts'

export function currentMemberships(db: Database, date: string) {
  const openProjectIds = new Set(
    db.projects
      .filter((project) => projectStatus(project, date) !== '종료')
      .map((project) => project.project_id),
  )
  return db.members.filter(
    (member) =>
      openProjectIds.has(member.project_id) &&
      (!member.assignment_end_date || member.assignment_end_date >= date),
  )
}

export function employeesWithoutProjects(db: Database, date: string) {
  const participating = new Set(currentMemberships(db, date).map((member) => member.employee_id))
  return db.employees.filter(
    (employee) =>
      employee.employment_status === 'ACTIVE' && !participating.has(employee.employee_id),
  )
}

export function personalProjects(db: Database, user: Employee, date: string) {
  const memberships = currentMemberships(db, date).filter(
    (member) => member.employee_id === user.employee_id,
  )
  return db.projects.filter((project) =>
    memberships.some((member) => member.project_id === project.project_id),
  )
}

export function currentPmProjects(db: Database, user: Employee, date: string) {
  return personalProjects(db, user, date).filter((project) => isPM(db, user, project.project_id))
}

export function upcomingPmProjects(db: Database, user: Employee, date: string) {
  return currentPmProjects(db, user, date)
    .map((project) => ({
      project,
      days: Math.round((Date.parse(project.planned_end_date) - Date.parse(date)) / 86_400_000),
    }))
    .filter(({ days }) => days >= 0 && days <= 7)
    .sort((a, b) => a.days - b.days || a.project.project_id - b.project.project_id)
}
