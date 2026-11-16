import type { Database, Employee, Project, EvaluationType } from '../model/entities.ts'
import { participantMembers } from './evaluations.ts'

export function evaluationTargets(
  db: Database,
  user: Employee,
  project: Project,
  type: EvaluationType,
) {
  if (!project.actual_end_date) return []
  const own = participantMembers(db, project).find(
    (member) => member.employee_id === user.employee_id,
  )
  if (!own || (type !== 'PEER' && own.project_role !== 'PM')) return []
  if (type === 'CLIENT' && (!project.evaluation_requested_date || project.evaluation_reported_date))
    return []
  return participantMembers(db, project).filter(
    (member) =>
      (type === 'CLIENT' || member.member_id !== own.member_id) &&
      (type !== 'PM' || member.project_role !== 'PM') &&
      !db.evaluations.some(
        (evaluation) =>
          evaluation.target_member_id === member.member_id &&
          evaluation.evaluation_type === type &&
          (type === 'CLIENT' || evaluation.evaluator_member_id === own.member_id),
      ),
  )
}

export function pendingEvaluationTasks(db: Database, user: Employee) {
  const types: EvaluationType[] = ['PEER', 'PM', 'CLIENT']
  return db.projects
    .map((project) => ({
      project,
      count: types.reduce(
        (sum, type) => sum + evaluationTargets(db, user, project, type).length,
        0,
      ),
    }))
    .filter((task) => task.count > 0)
}
