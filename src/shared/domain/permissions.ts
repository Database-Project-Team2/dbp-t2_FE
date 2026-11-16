import type { Employee, Database, Evaluation, EvaluationResult } from '../model/entities.ts'

export const isManagement = (employee: Employee) => employee.system_role === 'MANAGEMENT'
export const canManageProject = (user: Employee) => isManagement(user)
export const canAccessPage = (user: Employee, page: string) =>
  isManagement(user) || !['people', 'history'].includes(page)

/** PM은 계정 권한이 아니라 해당 프로젝트에서 부여받은 역할입니다. */
export const isPM = (db: Database, user: Employee, projectId?: number) =>
  db.members.some(
    (member) =>
      member.employee_id === user.employee_id &&
      member.project_role === 'PM' &&
      (projectId === undefined || member.project_id === projectId),
  )

export const visibleProjects = (db: Database, user: Employee) =>
  db.projects.filter(
    (project) =>
      isManagement(user) ||
      db.members.some(
        (member) =>
          member.project_id === project.project_id && member.employee_id === user.employee_id,
      ),
  )

export const visibleClients = (db: Database, user: Employee) => {
  const clientIds = new Set(visibleProjects(db, user).map((project) => project.client_id))
  return db.clients.filter((client) => isManagement(user) || clientIds.has(client.client_id))
}

/** 전체 투입 이력 페이지는 경영진 전용. 본인 프로필에서는 실제 참여 경력을 유지합니다. */
export const visibleHistory = (db: Database, user: Employee) =>
  db.members.filter(
    (member) =>
      isManagement(user) ||
      (member.employee_id === user.employee_id && member.assignment_start_date !== null),
  )

export function canReadEvaluationComments(
  db: Database,
  user: Employee,
  evaluation: Pick<Evaluation, 'target_member_id'>,
) {
  const target = db.members.find((member) => member.member_id === evaluation.target_member_id)
  return !!target && (isManagement(user) || isPM(db, user, target.project_id))
}

/** 조회 범위와 의견 공개 범위를 분리해 화면과 CSV에 같은 규칙을 적용합니다. */
export function visibleEvaluations(db: Database, user: Employee): EvaluationResult[] {
  const projectIds = new Set(visibleProjects(db, user).map((project) => project.project_id))
  const memberIds = new Set(
    db.members
      .filter((member) => projectIds.has(member.project_id))
      .map((member) => member.member_id),
  )
  return db.evaluations
    .filter((evaluation) => memberIds.has(evaluation.target_member_id))
    .map((evaluation) => {
      if (canReadEvaluationComments(db, user, evaluation)) return evaluation
      const {
        work_performance_comment: _work,
        communication_comment: _communication,
        ...scores
      } = evaluation
      return scores
    })
}
