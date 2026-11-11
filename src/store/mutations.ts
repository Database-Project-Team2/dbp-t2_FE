import { isManagement } from '../shared/domain/permissions.ts'
import { nextId } from './demoData.ts'
import { validateEvaluation, advanceWorkflow } from '../shared/domain/evaluations.ts'
import { validateMember } from '../shared/domain/assignments.ts'
import { validateProject } from '../shared/domain/projects.ts'
import type { Client, Employee, Evaluation, Member, Project } from '../shared/model/entities.ts'
import type { DemoState } from './types.ts'

/** 검증 후 새 상태를 반환합니다. React나 브라우저 저장소에는 접근하지 않습니다. */
export function saveProjectInState(state: DemoState, user: Employee, input: Project) {
  const existing = state.projects.find((project) => project.project_id === input.project_id)
  validateProject(state, user, input, !existing)
  if (existing?.actual_end_date) throw new Error('이미 종료한 프로젝트는 변경할 수 없어요.')

  const project: Project = {
    ...input,
    project_name: input.project_name.trim(),
    project_id: existing?.project_id || nextId(state.projects.map((project) => project.project_id)),
  }
  const projects = existing
    ? state.projects.map((current) =>
        current.project_id === project.project_id ? project : current,
      )
    : [...state.projects, project]

  // 프로젝트 종료와 실제 투입 종료를 하나의 상태 변경으로 처리합니다.
  const members = input.actual_end_date
    ? state.members.map((member) =>
        member.project_id === input.project_id &&
        member.assignment_start_date &&
        !member.assignment_end_date
          ? { ...member, assignment_end_date: input.actual_end_date }
          : member,
      )
    : state.members

  return { state: { ...state, projects, members }, projectId: project.project_id }
}

export function saveMemberInState(state: DemoState, user: Employee, input: Member): DemoState {
  validateMember(state, user, input)
  const exists = state.members.some((member) => member.member_id === input.member_id)
  const member = {
    ...input,
    member_id: exists ? input.member_id : nextId(state.members.map((member) => member.member_id)),
  }
  const members = exists
    ? state.members.map((current) => (current.member_id === member.member_id ? member : current))
    : [...state.members, member]
  return { ...state, members }
}

export function saveEvaluationInState(
  state: DemoState,
  user: Employee,
  input: Evaluation,
): DemoState {
  const evaluation = {
    ...input,
    evaluation_id: nextId(state.evaluations.map((evaluation) => evaluation.evaluation_id)),
    work_performance_comment: input.work_performance_comment.trim(),
    communication_comment: input.communication_comment.trim(),
  }
  validateEvaluation(state, user, evaluation)
  return { ...state, evaluations: [...state.evaluations, evaluation] }
}

export function recordWorkflowInState(
  state: DemoState,
  user: Employee,
  projectId: number,
  date: string,
): DemoState {
  const project = state.projects.find((project) => project.project_id === projectId)
  if (!project) throw new Error('프로젝트가 없어요.')
  const updated = advanceWorkflow(state, user, project, date)
  return {
    ...state,
    projects: state.projects.map((project) =>
      project.project_id === projectId ? updated : project,
    ),
  }
}

export function saveClientInState(state: DemoState, user: Employee, input: Client): DemoState {
  if (!isManagement(user)) throw new Error('발주처 등록은 경영진만 할 수 있어요.')
  if (
    !input.client_name.trim() ||
    !input.contact_name.trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.contact_email)
  ) {
    throw new Error('발주처명, 담당자와 올바른 이메일을 입력해 주세요.')
  }
  const exists = state.clients.some((client) => client.client_id === input.client_id)
  const client = {
    ...input,
    client_id: exists ? input.client_id : nextId(state.clients.map((client) => client.client_id)),
  }
  return {
    ...state,
    clients: exists
      ? state.clients.map((current) => (current.client_id === client.client_id ? client : current))
      : [...state.clients, client],
  }
}
