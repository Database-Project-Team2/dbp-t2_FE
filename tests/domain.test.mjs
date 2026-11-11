import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {
  advanceWorkflow,
  clientCoverage,
  validateEvaluation,
} from '../src/shared/domain/evaluations.ts'
import { csvContent } from '../src/shared/lib/csv.ts'
import { isAssigned, validateMember } from '../src/shared/domain/assignments.ts'
import { nextEmployeeNo, normalizeId } from '../src/shared/domain/employees.ts'
import {
  ongoingProjectMembers,
  matchesProjectSearch,
  projectStatus,
  validateProject,
} from '../src/shared/domain/projects.ts'
import { overlapsPeriod } from '../src/shared/lib/date.ts'
import {
  visibleEvaluations,
  visibleHistory,
  visibleProjects,
} from '../src/shared/domain/permissions.ts'

const seed = JSON.parse(fs.readFileSync(new URL('../src/data/seed.json', import.meta.url), 'utf8'))
const fresh = () => structuredClone(seed)
const manager = seed.employees[0],
  pm = seed.employees[4],
  employee = seed.employees[1]
const candidate = (overrides = {}) => ({
  evaluation_id: 999,
  target_member_id: 8,
  evaluation_type: 'CLIENT',
  evaluator_member_id: null,
  registered_by_member_id: 6,
  evaluated_date: '2026-07-06',
  work_performance_score: 4,
  work_performance_comment: '요구사항을 정확히 반영했어요.',
  communication_score: 5,
  communication_comment: '진행 상황을 명확히 공유했어요.',
  ...overrides,
})
test('SQL seed retains all table relationships and row counts', () => {
  assert.deepEqual(Object.fromEntries(Object.entries(seed).map(([k, v]) => [k, v.length])), {
    employees: 10,
    clients: 3,
    projects: 4,
    members: 20,
    evaluations: 34,
  })
  for (const m of seed.members) {
    assert(seed.employees.some((e) => e.employee_id === m.employee_id))
    assert(seed.projects.some((p) => p.project_id === m.project_id))
  }
  for (const e of seed.evaluations) {
    const target = seed.members.find((m) => m.member_id === e.target_member_id)
    const registrant = seed.members.find((m) => m.member_id === e.registered_by_member_id)
    assert.equal(target.project_id, registrant.project_id)
  }
})
test('overdue planned end does not close an unfinished project', () =>
  assert.equal(projectStatus(seed.projects[2], '2026-11-10'), '진행 중'))
test('historical assignment is inclusive and excludes unassigned members', () => {
  assert.equal(seed.members.filter((m) => isAssigned(m, '2026-08-15')).length, 9)
  assert.equal(seed.members.filter((m) => isAssigned(m, '2026-11-10')).length, 3)
  assert(isAssigned(seed.members[12], '2026-09-15'))
  assert(!isAssigned(seed.members[12], '2026-09-16'))
  assert(!isAssigned(seed.members[14], '2026-11-10'))
})
test('role scopes limit projects, employee histories and evaluation results', () => {
  assert.equal(visibleProjects(seed, manager).length, 4)
  assert.deepEqual(
    visibleProjects(seed, employee).map((p) => p.project_id),
    [1, 3],
  )
  assert(visibleHistory(seed, employee).every((m) => m.employee_id === 2))
  assert.equal(visibleEvaluations(seed, employee).length, 0)
  assert(
    visibleEvaluations(seed, pm).every(
      (e) => seed.members.find((m) => m.member_id === e.registered_by_member_id).employee_id === 5,
    ),
  )
})
test('customer evaluation preserves external evaluator and PM registrant', () =>
  assert.doesNotThrow(() => validateEvaluation(seed, pm, candidate())))
test('customer duplicates are rejected even with nullable evaluator', () =>
  assert.throws(
    () => validateEvaluation(seed, pm, candidate({ target_member_id: 6 })),
    /이미 제출/,
  ))
test('self-evaluation and wrong-project registrants are blocked', () => {
  assert.throws(
    () =>
      validateEvaluation(
        seed,
        pm,
        candidate({ evaluation_type: 'PEER', evaluator_member_id: 6, target_member_id: 6 }),
      ),
    /자기 자신/,
  )
  assert.throws(
    () => validateEvaluation(seed, manager, candidate({ registered_by_member_id: 1 })),
    /참여한 프로젝트/,
  )
})
test('PM rating excludes PM and non-PM authors', () => {
  assert.throws(
    () =>
      validateEvaluation(
        seed,
        seed.employees[5],
        candidate({ evaluation_type: 'PM', evaluator_member_id: 7, registered_by_member_id: 7 }),
      ),
    /PM 평가/,
  )
  assert.throws(
    () =>
      validateEvaluation(
        seed,
        pm,
        candidate({ evaluation_type: 'PM', evaluator_member_id: 6, target_member_id: 6 }),
      ),
    /자기 자신/,
  )
})
test('both integer scores and nonempty comments are required', () => {
  for (const score of [0, 6, 2.5])
    assert.throws(
      () => validateEvaluation(seed, pm, candidate({ work_performance_score: score })),
      /1~5점/,
    )
  assert.throws(
    () => validateEvaluation(seed, pm, candidate({ communication_comment: '  ' })),
    /평가 의견/,
  )
})
test('evaluation before project end and on unfinished projects is rejected', () => {
  assert.throws(
    () => validateEvaluation(seed, pm, candidate({ evaluated_date: '2026-07-01' })),
    /실제 종료일/,
  )
  assert.throws(
    () =>
      validateEvaluation(
        seed,
        manager,
        candidate({ target_member_id: 12, registered_by_member_id: 11 }),
      ),
    /프로젝트가 종료/,
  )
})
test('request / all returned / report requires complete coverage and ordered dates', () => {
  const db = fresh()
  let p = db.projects[1]
  assert.deepEqual(clientCoverage(db, p), { total: 5, received: 2 })
  assert.throws(() => advanceWorkflow(db, pm, p, '2026-07-06'), /전원의 고객평가/)
  for (const id of [8, 9, 10]) db.evaluations.push(candidate({ target_member_id: id }))
  p = advanceWorkflow(db, pm, p, '2026-07-07')
  assert.equal(p.evaluation_received_date, '2026-07-07')
  assert.throws(() => advanceWorkflow(db, pm, p, '2026-07-06'), /보고일/)
  p = advanceWorkflow(db, pm, p, '2026-07-08')
  assert.equal(p.evaluation_reported_date, '2026-07-08')
})
test('ordinary members cannot advance customer workflow', () =>
  assert.throws(() => advanceWorkflow(seed, employee, seed.projects[0], '2026-04-07'), /PM만/))
test('duplicate memberships, fixed roles, retired or leave staff blocked', () => {
  const input = {
    member_id: 0,
    project_id: 3,
    employee_id: 3,
    project_role: 'PROGRAMMER',
    assignment_start_date: '2026-08-04',
    assignment_end_date: null,
  }
  assert.doesNotThrow(() => validateMember(seed, manager, input))
  assert.throws(() => validateMember(seed, manager, { ...input, employee_id: 2 }), /이미 등록/)
  assert.throws(
    () => validateMember(seed, manager, { ...seed.members[11], project_role: 'PM' }),
    /역할은 변경/,
  )
  assert.throws(
    () =>
      validateMember(seed, manager, { ...seed.members[14], assignment_start_date: '2026-08-04' }),
    /재직 중/,
  )
  assert.throws(() => validateMember(seed, manager, { ...input, employee_id: 10 }), /재직 중/)
})
test('membership period must be within project start and cannot reopen', () => {
  assert.throws(
    () =>
      validateMember(seed, manager, { ...seed.members[11], assignment_start_date: '2026-07-01' }),
    /착수일/,
  )
  assert.throws(
    () => validateMember(seed, manager, { ...seed.members[12], assignment_end_date: null }),
    /재투입/,
  )
  assert.throws(
    () => validateMember(seed, manager, { ...seed.members[11], assignment_end_date: '2026-07-01' }),
    /종료일은 투입 시작일/,
  )
})
test('closing project before an existing member period is rejected', () =>
  assert.throws(
    () =>
      validateProject(seed, manager, { ...seed.projects[2], actual_end_date: '2026-08-10' }, false),
    /투입기간/,
  ))
test('self sign-up generates next year-specific employee number', () => {
  assert.equal(nextEmployeeNo(seed, '2026-11-10'), '20260001')
  assert.equal(nextEmployeeNo(seed, '2025-11-10'), '20250006')
  assert.equal(normalizeId(' Demo01 '), 'demo01')
})
test('CSV escapes quotes, newlines, and spreadsheet formulas', () => {
  const csv = csvContent(['이름', '값'], [['=SUM(A1)', 'a"b\nc']])
  assert(csv.startsWith('\uFEFF'))
  assert(csv.includes("'="))
  assert(csv.includes('a""b\nc'))
})

test('SRH-002/003 exclude never-started memberships from employee views but retain management records', () => {
  const db = fresh()
  const unassigned = { ...db.employees.find((e) => e.employee_id === 9), system_role: 'EMPLOYEE' }
  assert.equal(visibleProjects(db, unassigned).length, 0)
  assert.equal(visibleHistory(db, unassigned).length, 0)
  assert(
    visibleHistory(db, manager).some(
      (m) => m.employee_id === 9 && m.assignment_start_date === null,
    ),
  )
  assert.equal(visibleProjects(db, manager).length, 4)
  db.members.find((m) => m.employee_id === 9).assignment_start_date = '2026-09-01'
  assert.deepEqual(
    visibleProjects(db, unassigned).map((p) => p.project_id),
    [3],
  )
  assert.equal(visibleHistory(db, unassigned).length, 1)
})
test('QRY-002 excludes closed projects even when assignment end date is today', () => {
  const db = fresh()
  const date = '2026-11-10'
  db.projects[2].actual_end_date = date
  for (const m of db.members.filter(
    (m) => m.project_id === 3 && m.assignment_start_date && !m.assignment_end_date,
  ))
    m.assignment_end_date = date
  assert.equal(db.members.filter((m) => isAssigned(m, date)).length, 3)
  assert.equal(ongoingProjectMembers(db, date).length, 0)
  assert.equal(ongoingProjectMembers(seed, '2026-08-15').length, 9)
})
test('SRH-002 combines partial project and client names with status and actual dates', () => {
  const p = seed.projects[2]
  const filters = {
    query: '콘텐츠',
    client: '새봄',
    status: '진행 중',
    from: '2026-08-03',
    to: '2026-08-03',
  }
  assert(matchesProjectSearch(p, '가상 새봄교육', filters))
  assert(!matchesProjectSearch(p, '가상 새봄교육', { ...filters, client: '한빛' }))
  assert(!matchesProjectSearch(p, '가상 새봄교육', { ...filters, status: '종료' }))
  assert(!matchesProjectSearch(p, '가상 새봄교육', { ...filters, to: '2026-08-02' }))
  assert(
    matchesProjectSearch(p, '가상 새봄교육', { ...filters, from: '2027-01-01', to: '2027-12-31' }),
  )
})
test('SRH-002/003 null ends are open intervals and null starts never match a period', () => {
  assert(overlapsPeriod('2026-08-03', null, '2027-01-01', '2027-12-31'))
  assert(!overlapsPeriod(null, null, '2026-08-01', '2026-08-31'))
  assert(overlapsPeriod('2026-08-03', '2026-09-15', '2026-09-15', '2026-09-15'))
  assert(!overlapsPeriod('2026-08-03', '2026-09-15', '2026-09-16', '2026-09-20'))
  assert(!overlapsPeriod('2026-08-03', null, '2026-09-20', '2026-09-01'))
})
