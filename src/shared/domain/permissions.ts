import type { Employee, Database, Project } from '../model/entities.ts'

export const isManagement = (employee: Employee) => employee.system_role === 'MANAGEMENT'

export const isPM = (db: Database, user: Employee, projectId?: number) =>
  db.members.some(
    (member) =>
      member.employee_id === user.employee_id &&
      member.project_role === 'PM' &&
      (projectId === undefined || member.project_id === projectId),
  )

export const canManageProject = (db: Database, user: Employee, project: Project) =>
  isManagement(user) || isPM(db, user, project.project_id)

export const visibleProjects = (db: Database, user: Employee) =>
  db.projects.filter(
    (project) =>
      isManagement(user) ||
      db.members.some(
        (member) =>
          member.project_id === project.project_id &&
          member.employee_id === user.employee_id &&
          member.assignment_start_date !== null,
      ),
  )

export const visibleHistory = (db: Database, user: Employee) =>
  db.members.filter(
    (member) =>
      isManagement(user) ||
      (member.employee_id === user.employee_id && member.assignment_start_date !== null),
  )

export const visibleEvaluations = (db: Database, user: Employee) =>
  db.evaluations.filter(
    (evaluation) =>
      isManagement(user) ||
      (isPM(db, user) &&
        db.members.some(
          (member) =>
            member.member_id === evaluation.registered_by_member_id &&
            member.employee_id === user.employee_id,
        )),
  )
