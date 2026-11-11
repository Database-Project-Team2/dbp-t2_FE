import { assert } from '../lib/assert.ts'
import { canManageProject } from './permissions.ts'
import { today, validateDate } from '../lib/date.ts'
import type { Member, Database, Employee } from '../model/entities.ts'

export const isAssigned = (member: Member, date = today()) =>
  !!member.assignment_start_date &&
  member.assignment_start_date <= date &&
  (!member.assignment_end_date || member.assignment_end_date >= date)

export function validateMember(db: Database, user: Employee, member: Member) {
  const project = db.projects.find((project) => project.project_id === member.project_id)
  const employee = db.employees.find((employee) => employee.employee_id === member.employee_id)
  assert(project && employee, '프로젝트와 직원을 확인해 주세요.')
  assert(canManageProject(db, user, project), '구성원을 변경할 권한이 없어요.')
  assert(!project.actual_end_date, '종료된 프로젝트의 투입 이력은 변경할 수 없어요.')
  const original = db.members.find(
    (existingMember) => existingMember.member_id === member.member_id,
  )
  assert(
    !db.members.some(
      (existingMember) =>
        existingMember.project_id === member.project_id &&
        existingMember.employee_id === member.employee_id &&
        existingMember.member_id !== member.member_id,
    ),
    '이미 등록된 직원이에요. 동일 프로젝트 재투입은 지원하지 않아요.',
  )
  assert(
    !original || original.project_role === member.project_role,
    '처음 지정한 프로젝트 역할은 변경할 수 없어요.',
  )
  assert(
    !original?.assignment_end_date,
    '투입이 종료된 직원은 재투입하거나 기간을 변경할 수 없어요.',
  )
  assert(employee.employment_status === 'ACTIVE', '현재 재직 중인 직원만 투입할 수 있어요.')
  if (member.assignment_start_date) {
    validateDate(member.assignment_start_date, '실제 투입 시작일')
    assert(
      member.assignment_start_date >= project.actual_start_date &&
        member.assignment_start_date >= employee.hire_date,
      '투입은 프로젝트 착수일과 직원 입사일 이후여야 해요.',
    )
  }
  if (member.assignment_end_date) {
    validateDate(member.assignment_end_date, '실제 투입 종료일')
    assert(
      member.assignment_start_date && member.assignment_end_date >= member.assignment_start_date,
      '투입 종료일은 투입 시작일 이후여야 해요.',
    )
  }
}
