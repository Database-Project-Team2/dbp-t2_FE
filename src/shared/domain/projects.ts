import { assert } from '../lib/assert.ts'
import { isAssigned } from './assignments.ts'
import { isManagement, canManageProject } from './permissions.ts'
import { today, overlapsPeriod, validateDate } from '../lib/date.ts'
import type { Project, Database, Employee } from '../model/entities.ts'

export function projectStatus(project: Project, date = today()) {
  if (project.actual_start_date > date) return '착수 전'
  if (project.actual_end_date && project.actual_end_date <= date) return '종료'
  return '진행 중'
}

export function ongoingProjectMembers(db: Database, date = today()) {
  const ongoingProjectIds = new Set(
    db.projects
      .filter((project) => projectStatus(project, date) === '진행 중')
      .map((project) => project.project_id),
  )
  return db.members.filter(
    (member) => ongoingProjectIds.has(member.project_id) && isAssigned(member, date),
  )
}

export function matchesProjectSearch(
  project: Project,
  clientName: string,
  filters: { query: string; client: string; status: string; from: string; to: string },
) {
  return (
    project.project_name.toLowerCase().includes(filters.query.trim().toLowerCase()) &&
    clientName.toLowerCase().includes(filters.client.trim().toLowerCase()) &&
    (filters.status === '전체' || projectStatus(project) === filters.status) &&
    overlapsPeriod(project.actual_start_date, project.actual_end_date, filters.from, filters.to)
  )
}

export function validateProject(db: Database, user: Employee, project: Project, isNew: boolean) {
  assert(
    isNew ? isManagement(user) : canManageProject(db, user, project),
    '프로젝트를 변경할 권한이 없어요.',
  )
  assert(
    project.project_name.trim() && project.project_name.length <= 200,
    '프로젝트명을 1~200자로 입력해 주세요.',
  )
  assert(
    db.clients.some((client) => client.client_id === project.client_id),
    '발주처를 선택해 주세요.',
  )
  validateDate(project.actual_start_date, '실제 착수일')
  validateDate(project.planned_end_date, '예정 종료일', '9999-12-31')
  assert(
    project.planned_end_date >= project.actual_start_date,
    '예정 종료일은 착수일 이후여야 해요.',
  )
  if (project.actual_end_date) {
    validateDate(project.actual_end_date, '실제 종료일')
    assert(
      project.actual_end_date >= project.actual_start_date,
      '실제 종료일은 착수일 이후여야 해요.',
    )
  }
  for (const member of db.members.filter((member) => member.project_id === project.project_id)) {
    assert(
      !member.assignment_start_date || member.assignment_start_date >= project.actual_start_date,
      '기존 투입 시작일보다 늦게 착수일을 변경할 수 없어요.',
    )
    assert(
      !project.actual_end_date ||
        ((!member.assignment_start_date ||
          member.assignment_start_date <= project.actual_end_date) &&
          (!member.assignment_end_date || member.assignment_end_date <= project.actual_end_date)),
      '구성원의 투입기간보다 먼저 프로젝트를 종료할 수 없어요.',
    )
  }
}
