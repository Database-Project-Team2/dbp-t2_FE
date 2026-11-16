import type { Database, Employee } from '../model/entities.ts'

export function matchesEmployeeSearch(employee: Employee, query: string, skills = '', job = '') {
  const term = query.trim().normalize('NFC').toLowerCase()
  return (
    (!term ||
      `${employee.employee_name} ${employee.employee_no}`
        .normalize('NFC')
        .toLowerCase()
        .includes(term)) &&
    (!job || employee.job_category === job) &&
    skills
      .split(',')
      .map((skill) => skill.trim().toLowerCase())
      .filter(Boolean)
      .every((skill) => (employee.skill_description || '').toLowerCase().includes(skill))
  )
}

export function memberCandidates(db: Database, projectId: number) {
  const existing = new Set(
    db.members
      .filter((member) => member.project_id === projectId)
      .map((member) => member.employee_id),
  )
  // 다른 프로젝트에 참여 중이어도 이 프로젝트에 추가할 수 있습니다.
  return db.employees.filter(
    (employee) => employee.employment_status === 'ACTIVE' && !existing.has(employee.employee_id),
  )
}
