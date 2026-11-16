import test from 'node:test'
import assert from 'node:assert/strict'
import { freshDatabase } from '../src/store/demoData.ts'
import { loadDemoState } from '../src/store/browserStorage.ts'
import { migrateAccountRoles } from '../src/store/roleMigration.ts'
import {
  canAccessPage,
  isPM,
  canReadEvaluationComments,
  visibleProjects,
  visibleClients,
  visibleEvaluations,
} from '../src/shared/domain/permissions.ts'
import { evaluationCsvContent } from '../src/shared/domain/evaluationExport.ts'
import { memberCandidates, matchesEmployeeSearch } from '../src/shared/domain/employeeSearch.ts'
import {
  saveProjectInState,
  saveMemberInState,
  removeMemberInState,
} from '../src/store/mutations.ts'

const member = (overrides = {}) => ({
  member_id: 0,
  project_id: 3,
  employee_id: 3,
  project_role: 'PM',
  assignment_start_date: null,
  assignment_end_date: null,
  ...overrides,
})

test('loading legacy state keeps data and credentials but removes self-selected MANAGEMENT/PM', () => {
  const legacy = freshDatabase()
  legacy.employees[4].system_role = 'PM'
  legacy.employees.push({
    ...legacy.employees[1],
    employee_id: 11,
    employee_no: '20260001',
    login_id: 'new.manager',
    system_role: 'MANAGEMENT',
  })
  legacy.credentials['11'] = { salt: 'kept', hash: 'kept' }
  const before = structuredClone(legacy)
  const original = globalThis.localStorage
  globalThis.localStorage = { getItem: () => JSON.stringify(legacy) }
  try {
    const next = loadDemoState()
    assert.equal(
      next.employees.find((employee) => employee.login_id === 'demo01').system_role,
      'MANAGEMENT',
    )
    assert.equal(next.employees[4].system_role, 'EMPLOYEE')
    assert.equal(next.employees.at(-1).system_role, 'EMPLOYEE')
    for (const key of ['members', 'evaluations', 'projects', 'clients', 'credentials'])
      assert.deepEqual(next[key], legacy[key])
    assert.deepEqual(legacy, before)
    assert.deepEqual(migrateAccountRoles(next), next)
    assert(isPM(next, next.employees[4], 2))
  } finally {
    globalThis.localStorage = original
  }
})

test('employee and PM cannot access the employee directory or assignment route', () => {
  const db = freshDatabase()
  for (const user of [db.employees[1], db.employees[4]]) {
    for (const page of ['people', 'history']) assert(!canAccessPage(user, page))
    for (const page of ['dashboard', 'projects', 'evaluations', 'clients', 'profile'])
      assert(canAccessPage(user, page))
  }
  for (const page of ['people', 'history']) assert(canAccessPage(db.employees[0], page))
})

test('PM cannot create/edit/close projects or add/edit/delete members, even in their own project', () => {
  const db = freshDatabase()
  const pm = db.employees[4]
  const project = db.projects[3]
  project.actual_end_date = null
  project.evaluation_requested_date = null
  const own = db.members.find(
    (item) => item.project_id === project.project_id && item.employee_id === pm.employee_id,
  )
  own.assignment_end_date = null
  const before = structuredClone(db)
  for (const change of [
    { ...project, project_id: 0 },
    { ...project, project_name: '변경' },
    { ...project, actual_end_date: '2026-11-10' },
  ]) {
    assert.throws(() => saveProjectInState(db, pm, change), /권한/)
  }
  assert.throws(() => saveMemberInState(db, pm, own), /권한/)
  assert.throws(() => saveMemberInState(db, pm, member({ project_id: 4 })), /권한/)
  assert.throws(() => removeMemberInState(db, pm, 15), /경영진만/)
  assert.deepEqual(db, before)
})

test('management can remove only never-started membership without touching other projects', () => {
  const db = freshDatabase()
  const manager = db.employees[0]
  const next = saveMemberInState(db, manager, member())
  const added = next.members.at(-1)
  assert(isPM(next, next.employees[2], 3))
  const removed = removeMemberInState(next, manager, added.member_id)
  assert.deepEqual(removed.members, db.members)
  assert.equal(removed.employees, next.employees)
  assert.equal(removed.evaluations, next.evaluations)
  assert(!isPM(removed, removed.employees[2], 3))
  assert(next.members.some((item) => item.member_id === added.member_id))
  for (const item of db.members.filter((item) => item.assignment_start_date)) {
    assert.throws(() => removeMemberInState(db, manager, item.member_id), /투입 전/)
  }
  const started = db.members.find(
    (item) => item.project_id === 3 && item.assignment_start_date && !item.assignment_end_date,
  )
  assert.throws(
    () => saveMemberInState(db, manager, { ...started, assignment_start_date: null }),
    /투입 전으로/,
  )
  assert.throws(
    () => saveMemberInState(db, manager, { ...started, employee_id: 3 }),
    /프로젝트와 직원/,
  )
  assert.throws(() => removeMemberInState(db, manager, 9999), /찾을 수/)
})

test('search finds same-name employees by number and combines case-insensitive skill keywords', () => {
  const first = {
    ...freshDatabase().employees[1],
    employee_name: '동명이인',
    skill_description: 'Java, SQL, React',
  }
  const second = { ...first, employee_no: '20269999', skill_description: 'React, TypeScript' }
  assert(matchesEmployeeSearch(first, ' 동명이인 ', 'java, SQL'))
  assert(!matchesEmployeeSearch(second, '동명이인', 'java, SQL'))
  assert(matchesEmployeeSearch(second, '20269999', 'REACT'))
  assert(!matchesEmployeeSearch(first, '20269999'))
  const db = freshDatabase()
  db.members[2].assignment_end_date = null
  const candidates = memberCandidates(db, 3)
  assert(candidates.some((employee) => employee.employee_id === 3))
  assert(
    !candidates.some(
      (employee) => employee.employee_id === 2 || employee.employment_status !== 'ACTIVE',
    ),
  )
  assert.equal(
    saveMemberInState(db, db.employees[0], member()).members.filter(
      (item) => item.employee_id === 3,
    ).length,
    db.members.filter((item) => item.employee_id === 3).length + 1,
  )
})

test('project, client and score lists are scoped by membership, including preassignment', () => {
  const db = freshDatabase()
  const user = { ...db.employees[8], system_role: 'EMPLOYEE' }
  assert.deepEqual(
    visibleProjects(db, user).map((project) => project.project_id),
    [3],
  )
  assert.deepEqual(
    visibleClients(db, user).map((client) => client.client_id),
    [db.projects[2].client_id],
  )
  const employee = db.employees[1]
  const allowed = new Set(visibleProjects(db, employee).map((project) => project.project_id))
  assert(
    visibleEvaluations(db, employee).every((evaluation) =>
      allowed.has(
        db.members.find((item) => item.member_id === evaluation.target_member_id).project_id,
      ),
    ),
  )
  const outsider = { ...employee, employee_id: 999 }
  assert.deepEqual(visibleProjects(db, outsider), [])
  assert.deepEqual(visibleClients(db, outsider), [])
  assert.deepEqual(visibleEvaluations(db, outsider), [])
})

test('PM opinions are visible only in their PM project; CSV cannot expose other projects or opinions', () => {
  const db = freshDatabase()
  const user = db.employees[1]
  db.members.find(
    (item) => item.employee_id === user.employee_id && item.project_id === 1,
  ).project_role = 'PM'
  db.members.push(
    member({
      member_id: 999,
      project_id: 2,
      employee_id: user.employee_id,
      project_role: 'TESTER',
    }),
  )
  for (const evaluation of db.evaluations) {
    evaluation.work_performance_comment = `work-secret-${evaluation.evaluation_id}`
    evaluation.communication_comment = `communication-secret-${evaluation.evaluation_id}`
  }
  const results = visibleEvaluations(db, user)
  const csv = evaluationCsvContent(
    db,
    user,
    db.evaluations.map((evaluation) => evaluation.evaluation_id),
  )
  for (const evaluation of db.evaluations) {
    const projectId = db.members.find(
      (item) => item.member_id === evaluation.target_member_id,
    ).project_id
    assert.equal(canReadEvaluationComments(db, user, evaluation), projectId === 1)
    assert.equal(csv.includes(`"${evaluation.work_performance_comment}"`), projectId === 1)
    const result = results.find((item) => item.evaluation_id === evaluation.evaluation_id)
    if (projectId === 2) {
      assert.equal(result.work_performance_score, evaluation.work_performance_score)
      assert(!Object.hasOwn(result, 'work_performance_comment'))
      assert(!Object.hasOwn(result, 'communication_comment'))
    }
  }
  const managerCsv = evaluationCsvContent(
    db,
    db.employees[0],
    db.evaluations.map((evaluation) => evaluation.evaluation_id),
  )
  assert(
    db.evaluations.every((evaluation) => managerCsv.includes(evaluation.work_performance_comment)),
  )
  const ordinaryCsv = evaluationCsvContent(
    db,
    db.employees[2],
    db.evaluations.map((evaluation) => evaluation.evaluation_id),
  )
  assert(!ordinaryCsv.includes('의견'))
  assert(!ordinaryCsv.includes('secret'))
})
