import test from 'node:test'
import assert from 'node:assert/strict'
import { freshDatabase } from '../src/store/demoData.ts'
import {
  employeesWithoutProjects,
  currentPmProjects,
  upcomingPmProjects,
} from '../src/features/dashboard/model/dashboardOverview.ts'
import { evaluationTargets, pendingEvaluationTasks } from '../src/shared/domain/evaluationTasks.ts'
import { saveEvaluationInState } from '../src/store/mutations.ts'

const today = '2026-11-16'
function schedule() {
  const db = freshDatabase()
  const pm = db.employees[4]
  db.projects = [
    '2026-11-15',
    '2026-11-16',
    '2026-11-23',
    '2026-11-24',
    '2026-11-18',
    '2026-11-19',
    '2026-11-20',
  ].map((end, index) => ({
    ...db.projects[2],
    project_id: index + 100,
    planned_end_date: end,
    actual_end_date: index === 4 ? '2026-11-16' : null,
  }))
  db.members = db.projects.map((project, index) => ({
    member_id: index + 100,
    project_id: project.project_id,
    employee_id: pm.employee_id,
    project_role: index === 5 ? 'TESTER' : 'PM',
    assignment_start_date: '2026-08-04',
    assignment_end_date: index === 6 ? '2026-11-15' : null,
  }))
  return { db, pm }
}

test('PM deadline card includes D-Day and D-7, excludes overdue, D-8, closed, ended membership and non-PM', () => {
  const { db, pm } = schedule()
  assert.deepEqual(
    upcomingPmProjects(db, pm, today).map(({ project, days }) => [project.project_id, days]),
    [
      [101, 0],
      [102, 7],
    ],
  )
  assert.equal(currentPmProjects(db, pm, today).length, 4)
  assert.deepEqual(upcomingPmProjects(db, db.employees[1], today), [])
  db.members.forEach((member) => {
    member.project_role = 'PROGRAMMER'
  })
  assert.deepEqual(currentPmProjects(db, pm, today), [])
})

test('employees without projects excludes reserved and concurrent participants but ignores completed projects', () => {
  const db = freshDatabase()
  db.employees = db.employees.slice(0, 4)
  db.projects = [
    { ...db.projects[2], project_id: 100 },
    { ...db.projects[2], project_id: 101 },
    { ...db.projects[0], project_id: 102 },
  ]
  const member = (employee_id, project_id, start) => ({
    employee_id,
    project_id,
    assignment_start_date: start,
    assignment_end_date: null,
  })
  db.members = [
    member(1, 100, '2026-08-04'),
    member(1, 101, '2026-08-04'),
    member(2, 100, null),
    member(3, 102, '2026-01-05'),
  ]
  assert.deepEqual(
    employeesWithoutProjects(db, today).map((employee) => employee.employee_id),
    [3, 4],
  )
  db.employees[3].employment_status = 'ON_LEAVE'
  assert.deepEqual(
    employeesWithoutProjects(db, today).map((employee) => employee.employee_id),
    [3],
  )
})

test('remaining evaluation counts match form targets, decrease after submit and exclude unstarted or unrelated projects', () => {
  const db = freshDatabase()
  db.evaluations = []
  const employee = db.employees[1]
  const project = db.projects[0]
  const targets = evaluationTargets(db, employee, project, 'PEER')
  const own = db.members.find(
    (member) =>
      member.project_id === project.project_id && member.employee_id === employee.employee_id,
  )
  assert.equal(targets.length, 4)
  assert(!targets.some((member) => member.member_id === own.member_id))
  assert.deepEqual(evaluationTargets(db, employee, project, 'PM'), [])
  assert.deepEqual(evaluationTargets(db, employee, project, 'CLIENT'), [])
  assert.deepEqual(evaluationTargets(db, employee, db.projects[2], 'PEER'), [])
  assert.deepEqual(pendingEvaluationTasks(db, { ...employee, employee_id: 999 }), [])
  const next = saveEvaluationInState(db, employee, {
    evaluation_id: 0,
    target_member_id: targets[0].member_id,
    evaluation_type: 'PEER',
    evaluator_member_id: own.member_id,
    registered_by_member_id: own.member_id,
    evaluated_date: '2026-04-08',
    work_performance_score: 4,
    communication_score: 5,
    work_performance_comment: '검증용 의견',
    communication_comment: '검증용 의견',
  })
  assert.equal(pendingEvaluationTasks(db, employee)[0].count, 4)
  assert.equal(pendingEvaluationTasks(next, employee)[0].count, 3)
})

test('PM evaluation tasks honor request/report stages and project-specific roles', () => {
  const db = freshDatabase()
  const pm = db.employees[4]
  const project = db.projects[1]
  assert.equal(evaluationTargets(db, pm, project, 'CLIENT').length, 3)
  assert(evaluationTargets(db, pm, project, 'PM').every((member) => member.project_role !== 'PM'))
  project.evaluation_requested_date = null
  assert.deepEqual(evaluationTargets(db, pm, project, 'CLIENT'), [])
  project.evaluation_requested_date = '2026-07-03'
  project.evaluation_reported_date = '2026-07-08'
  assert.deepEqual(evaluationTargets(db, pm, project, 'CLIENT'), [])
})
