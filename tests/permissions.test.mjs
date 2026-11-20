import test from 'node:test'
import assert from 'node:assert/strict'
import { canAccessPage } from '../src/shared/domain/permissions.ts'
import { canRemoveMember } from '../src/shared/domain/assignments.ts'

const employee = { system_role: 'EMPLOYEE' }
const manager = { system_role: 'MANAGEMENT' }

test('only management can open the employee directory and assignment history', () => {
  for (const page of ['people', 'history']) {
    assert.equal(canAccessPage(employee, page), false)
    assert.equal(canAccessPage(manager, page), true)
  }
  for (const page of ['dashboard', 'projects', 'evaluations', 'clients', 'profile'])
    assert.equal(canAccessPage(employee, page), true)
})

test('the remove action is available only to management for unstarted assignments', () => {
  const pending = { assignment_start_date: null, assignment_end_date: null }
  assert.equal(canRemoveMember(manager, pending), true)
  assert.equal(canRemoveMember(employee, pending), false)
  assert.equal(canRemoveMember(manager, { ...pending, assignment_start_date: '2026-01-01' }), false)
  assert.equal(canRemoveMember(manager, { ...pending, assignment_end_date: '2026-01-02' }), false)
})
