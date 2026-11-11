import { assert } from '../lib/assert.ts'
import { isPM } from './permissions.ts'
import { validateDate } from '../lib/date.ts'
import type { Database, Project, Employee, Evaluation } from '../model/entities.ts'

export const participantMembers = (db: Database, project: Project) =>
  db.members.filter(
    (member) =>
      member.project_id === project.project_id &&
      member.assignment_start_date &&
      (!project.actual_end_date || member.assignment_start_date <= project.actual_end_date),
  )

export const clientCoverage = (db: Database, project: Project) => {
  const targets = participantMembers(db, project)
  return {
    total: targets.length,
    received: targets.filter((member) =>
      db.evaluations.some(
        (evaluation) =>
          evaluation.target_member_id === member.member_id &&
          evaluation.evaluation_type === 'CLIENT',
      ),
    ).length,
  }
}

export const workflowLabel = (project: Project) =>
  project.evaluation_reported_date
    ? '보고 완료'
    : project.evaluation_received_date
      ? '보고 대기'
      : project.evaluation_requested_date
        ? '회수 중'
        : '의뢰 전'

export function validateEvaluation(db: Database, user: Employee, evaluation: Evaluation) {
  const target = db.members.find((member) => member.member_id === evaluation.target_member_id)
  const registrant = db.members.find(
    (member) => member.member_id === evaluation.registered_by_member_id,
  )
  assert(target && registrant, '평가 대상과 등록자를 선택해 주세요.')
  const project = db.projects.find((project) => project.project_id === target.project_id)
  assert(project?.actual_end_date, '프로젝트가 종료된 후 평가할 수 있어요.')
  assert(
    registrant.employee_id === user.employee_id && registrant.project_id === target.project_id,
    '본인이 참여한 프로젝트만 평가할 수 있어요.',
  )
  assert(
    target.assignment_start_date && registrant.assignment_start_date,
    '실제 투입 이력이 있는 구성원만 평가에 참여할 수 있어요.',
  )
  validateDate(evaluation.evaluated_date, '평가일')
  assert(
    evaluation.evaluated_date >= project.actual_end_date,
    '평가일은 프로젝트 실제 종료일 이후여야 해요.',
  )
  if (evaluation.evaluation_type === 'CLIENT') {
    assert(
      registrant.project_role === 'PM' && evaluation.evaluator_member_id === null,
      '고객평가는 해당 프로젝트의 PM만 등록할 수 있어요.',
    )
    assert(
      project.evaluation_requested_date &&
        evaluation.evaluated_date >= project.evaluation_requested_date,
      '고객평가 의뢰일을 먼저 기록해 주세요. 평가일은 의뢰일 이후여야 해요.',
    )
    assert(!project.evaluation_reported_date, '보고를 완료한 고객평가는 변경할 수 없어요.')
  } else {
    assert(
      evaluation.evaluator_member_id === registrant.member_id,
      '내부평가의 작성자와 등록자는 같아야 해요.',
    )
    assert(target.member_id !== registrant.member_id, '자기 자신을 평가할 수 없어요.')
    if (evaluation.evaluation_type === 'PM')
      assert(
        registrant.project_role === 'PM' && target.project_role !== 'PM',
        'PM 평가는 해당 PM이 PM을 제외한 팀원에게 작성해요.',
      )
  }
  assert(
    !db.evaluations.some(
      (existingEvaluation) =>
        existingEvaluation.evaluation_id !== evaluation.evaluation_id &&
        existingEvaluation.target_member_id === evaluation.target_member_id &&
        existingEvaluation.evaluation_type === evaluation.evaluation_type &&
        (evaluation.evaluation_type === 'CLIENT' ||
          existingEvaluation.evaluator_member_id === evaluation.evaluator_member_id),
    ),
    '이미 제출한 평가가 있어요. 같은 대상·유형·평가자의 평가는 한 번만 등록할 수 있어요.',
  )
  for (const score of [evaluation.work_performance_score, evaluation.communication_score])
    assert(
      Number.isInteger(score) && score >= 1 && score <= 5,
      '두 항목 모두 1~5점으로 선택해 주세요.',
    )
  assert(
    evaluation.work_performance_comment.trim() && evaluation.communication_comment.trim(),
    '두 항목 모두 평가 의견을 작성해 주세요.',
  )
}

export function advanceWorkflow(
  db: Database,
  user: Employee,
  project: Project,
  date: string,
): Project {
  assert(
    isPM(db, user, project.project_id),
    '고객평가 진행 상태는 해당 프로젝트 PM만 기록할 수 있어요.',
  )
  assert(project.actual_end_date, '프로젝트 종료 후 고객평가를 의뢰할 수 있어요.')
  validateDate(date, '처리일')
  assert(date >= project.actual_end_date, '처리일은 프로젝트 종료일 이후여야 해요.')
  if (!project.evaluation_requested_date) return { ...project, evaluation_requested_date: date }
  if (!project.evaluation_received_date) {
    const coverage = clientCoverage(db, project)
    assert(
      coverage.total > 0 && coverage.total === coverage.received,
      `참여자 전원의 고객평가가 필요해요. 현재 ${coverage.received}/${coverage.total}명 등록됐어요.`,
    )
    assert(date >= project.evaluation_requested_date, '회수일은 의뢰일 이후여야 해요.')
    const participantIds = participantMembers(db, project).map((member) => member.member_id)
    assert(
      db.evaluations
        .filter(
          (evaluation) =>
            participantIds.includes(evaluation.target_member_id) &&
            evaluation.evaluation_type === 'CLIENT',
        )
        .every((evaluation) => evaluation.evaluated_date <= date),
      '회수일은 등록된 모든 고객평가일 이후여야 해요.',
    )
    return { ...project, evaluation_received_date: date }
  }
  assert(!project.evaluation_reported_date, '이미 보고가 완료됐어요.')
  assert(date >= project.evaluation_received_date, '보고일은 회수일 이후여야 해요.')
  return { ...project, evaluation_reported_date: date }
}
