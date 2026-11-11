import test from 'node:test'
import assert from 'node:assert/strict'
import { freshDatabase } from '../src/store/demoData.ts'
import {
  saveProjectInState,
  saveMemberInState,
  saveEvaluationInState,
  recordWorkflowInState,
  saveClientInState,
} from '../src/store/mutations.ts'
import { makeCredential } from '../src/store/credentials.ts'

function customerEvaluation(targetMemberId) {
  return {
    evaluation_id: 0,
    target_member_id: targetMemberId,
    evaluation_type: 'CLIENT',
    evaluator_member_id: null,
    registered_by_member_id: 6,
    evaluated_date: '2026-07-06',
    work_performance_score: 4,
    work_performance_comment: ' 요구사항을 반영했습니다. ',
    communication_score: 5,
    communication_comment: ' 진행 상황을 공유했습니다. ',
  }
}

test('closing a project updates active memberships together without mutating the previous state', () => {
  const original = freshDatabase()
  const snapshot = structuredClone(original)
  const manager = original.employees[0]
  const project = original.projects.find((project) => project.project_id === 3)
  const result = saveProjectInState(original, manager, {
    ...project,
    actual_end_date: '2026-11-10',
  })
  assert.deepEqual(original, snapshot)
  assert.equal(result.projectId, 3)
  assert.equal(
    result.state.projects.find((project) => project.project_id === 3).actual_end_date,
    '2026-11-10',
  )
  for (const before of original.members.filter((member) => member.project_id === 3)) {
    const after = result.state.members.find((member) => member.member_id === before.member_id)
    assert.equal(
      after.assignment_end_date,
      before.assignment_start_date && !before.assignment_end_date
        ? '2026-11-10'
        : before.assignment_end_date,
    )
  }
  assert.equal(result.state.credentials, original.credentials)
})

test('a rejected project close leaves all original project and membership rows intact', () => {
  const original = freshDatabase()
  const snapshot = structuredClone(original)
  assert.throws(
    () =>
      saveProjectInState(original, original.employees[0], {
        ...original.projects[2],
        actual_end_date: '2026-08-10',
      }),
    /투입기간/,
  )
  assert.deepEqual(original, snapshot)
})

test('membership creation allocates a unique ID and rejects duplicate submissions', () => {
  const original = freshDatabase()
  const input = {
    member_id: 0,
    project_id: 3,
    employee_id: 3,
    project_role: 'PROGRAMMER',
    assignment_start_date: '2026-08-04',
    assignment_end_date: null,
  }
  const next = saveMemberInState(original, original.employees[0], input)
  assert.equal(original.members.length, 20)
  assert.equal(next.members.length, 21)
  assert.equal(next.members.at(-1).member_id, 21)
  assert.throws(() => saveMemberInState(next, original.employees[0], input), /이미 등록/)
})

test('customer evaluations must be complete before receive/report and stay immutable on failure', () => {
  let state = freshDatabase()
  const pm = state.employees[4]
  const originalCount = state.evaluations.length
  assert.throws(() => recordWorkflowInState(state, pm, 2, '2026-07-06'), /전원의 고객평가/)
  for (const memberId of [8, 9, 10])
    state = saveEvaluationInState(state, pm, customerEvaluation(memberId))
  assert.equal(state.evaluations.length, originalCount + 3)
  assert.equal(state.evaluations.at(-1).work_performance_comment, '요구사항을 반영했습니다.')
  assert.equal(
    new Set(state.evaluations.map((evaluation) => evaluation.evaluation_id)).size,
    state.evaluations.length,
  )
  assert.throws(() => saveEvaluationInState(state, pm, customerEvaluation(8)), /이미 제출/)
  const collected = recordWorkflowInState(state, pm, 2, '2026-07-06')
  const reported = recordWorkflowInState(collected, pm, 2, '2026-07-07')
  assert.equal(state.projects[1].evaluation_received_date, null)
  assert.equal(collected.projects[1].evaluation_reported_date, null)
  assert.equal(reported.projects[1].evaluation_reported_date, '2026-07-07')
  assert.throws(() => recordWorkflowInState(reported, pm, 2, '2026-07-08'), /이미 보고/)
})

test('client edits preserve unrelated state and remain management-only', () => {
  const state = freshDatabase()
  const input = { ...state.clients[0], contact_name: '가상 새담당자' }
  assert.throws(() => saveClientInState(state, state.employees[1], input), /경영진만/)
  const updated = saveClientInState(state, state.employees[0], input)
  assert.equal(state.clients[0].contact_name, '김담당')
  assert.equal(updated.clients[0].contact_name, '가상 새담당자')
  assert.equal(updated.projects, state.projects)
})

test('demo credentials verify the same password and do not store plaintext', async () => {
  const credential = await makeCredential('example-password')
  assert.deepEqual(Object.keys(credential).sort(), ['hash', 'salt'])
  assert.notEqual(credential.hash, 'example-password')
  assert.equal((await makeCredential('example-password', credential.salt)).hash, credential.hash)
  assert.notEqual(
    (await makeCredential('different-password', credential.salt)).hash,
    credential.hash,
  )
})
