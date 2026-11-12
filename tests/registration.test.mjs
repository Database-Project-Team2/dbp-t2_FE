import test from 'node:test'
import assert from 'node:assert/strict'
import { freshDatabase } from '../src/store/demoData.ts'
import { registerEmployeeInState, validateRegistration } from '../src/store/registration.ts'
import { residentNumberError, maskResidentNumber } from '../src/shared/domain/residentNumber.ts'
import { signupErrors } from '../src/features/auth/model/authValidation.ts'
import { makeCredential } from '../src/store/credentials.ts'
import { EDUCATIONS, normalizeEducation } from '../src/shared/model/employeeOptions.ts'
import { canManageProject, isPM, visibleProjects } from '../src/shared/domain/permissions.ts'
import { loadSessionUserId, persistSessionUserId } from '../src/store/browserStorage.ts'

// 형식 검사 전용 합성 입력이며 실제 사람의 개인정보를 사용하지 않습니다.
const input = (overrides = {}) => ({
  employee_name: '가입검증',
  login_id: 'new.employee',
  education: '대졸(학사)',
  hire_date: '2026-01-02',
  total_career_months: 0,
  skill_description: ' TypeScript, SQL ',
  job_category: 'DEVELOPER',
  system_role: 'EMPLOYEE',
  resident_no: '000229-3000000',
  ...overrides,
})
const credential = { salt: 'test-salt', hash: 'test-hash' }
const formValues = (overrides = {}) => ({
  role: 'EMPLOYEE',
  loginId: 'new.employee',
  password: 'TestOnly123!',
  confirmation: 'TestOnly123!',
  name: '가입검증',
  residentNo: '000229-3000000',
  education: '대졸(학사)',
  hire: '2026-01-02',
  months: '0',
  job: 'DEVELOPER',
  skills: '',
  ...overrides,
})

test('resident number accepts 13 digits, optional separator and leap day without old checksum', () => {
  for (const value of ['000229-3000000', '0002293000000', '991231-2000000']) {
    assert.equal(residentNumberError(value, '2026-11-12'), '')
  }
  assert.equal(maskResidentNumber('0002293000000'), '000229-*******')
})

test('resident number rejects invalid length, letters, dates, category and future birth', () => {
  for (const value of [
    '',
    '-',
    '000229-3',
    '000229-30000000',
    '000229-300000a',
    '010229-3000000',
    '001301-3000000',
    '000000-3000000',
    '000229-5000000',
    '271101-3000000',
  ]) {
    assert.notEqual(residentNumberError(value, '2026-11-12'), '', value)
  }
})

test('signup requires role, education, ID check and matching passwords', () => {
  assert.deepEqual(signupErrors(formValues(), 'new.employee'), {})
  const errors = signupErrors(
    formValues({ role: '', education: '', confirmation: 'different' }),
    '',
  )
  assert.match(errors.role, /선택/)
  assert.match(errors.education, /선택/)
  assert.match(errors.loginId, /중복 확인/)
  assert.equal(errors.confirmation, '비밀번호가 일치하지 않아요.')
})

test('editing password or login ID invalidates the corresponding confirmation', () => {
  assert.equal(
    signupErrors(formValues({ password: 'Changed123!' }), 'new.employee').confirmation,
    '비밀번호가 일치하지 않아요.',
  )
  assert.match(signupErrors(formValues({ loginId: 'new.id' }), 'new.employee').loginId, /중복 확인/)
  assert.equal(
    signupErrors(formValues({ confirmation: '' }), 'new.employee').confirmation,
    '비밀번호를 한 번 더 입력해 주세요.',
  )
})

test('all three signup roles are saved and get a sequential employee number', () => {
  let state = freshDatabase()
  for (const [index, role] of ['MANAGEMENT', 'PM', 'EMPLOYEE'].entries()) {
    const before = state.employees.length
    const result = registerEmployeeInState(
      state,
      input({ login_id: 'new' + index, system_role: role }),
      credential,
    )
    assert.equal(result.employee.system_role, role)
    assert.equal(result.employee.employee_no, '2026' + String(index + 1).padStart(4, '0'))
    assert.equal(state.employees.length, before)
    assert.equal(result.state.employees.length, before + 1)
    state = result.state
  }
})

test('registration rejects case-insensitive duplicate IDs without mutating saved data', () => {
  const state = freshDatabase()
  const snapshot = structuredClone(state)
  assert.throws(
    () => registerEmployeeInState(state, input({ login_id: 'DEMO01' }), credential),
    /이미 사용/,
  )
  assert.deepEqual(state, snapshot)
})

test('registration stores a masked resident number and explicitly excludes raw form data', () => {
  const result = registerEmployeeInState(
    freshDatabase(),
    input({ password: 'must-not-be-saved' }),
    credential,
  )
  const saved = JSON.stringify(result.state)
  assert.equal(result.employee.resident_no_masked, '000229-*******')
  assert.equal(Object.hasOwn(result.employee, 'resident_no'), false)
  assert(!saved.includes('000229-3000000'))
  assert(!saved.includes('must-not-be-saved'))
  assert.deepEqual(result.state.credentials[result.employee.employee_id], credential)
})

test('registration validates all education choices and rejects invalid inputs at the store boundary', () => {
  for (const education of EDUCATIONS)
    assert.doesNotThrow(() => validateRegistration(input({ education })))
  for (const fields of [
    { education: '임의 학력' },
    { system_role: 'ADMIN' },
    { job_category: 'UNKNOWN' },
    { employee_name: ' ' },
    { login_id: 'a' },
    { hire_date: '2026-02-30' },
    { total_career_months: -1 },
    { total_career_months: 1.5 },
    { resident_no: '' },
  ]) {
    assert.throws(() => validateRegistration(input(fields)))
  }
  assert.equal(normalizeEducation('대학교 졸업'), '대졸(학사)')
})

test('selecting PM does not grant management access to unassigned projects', () => {
  const state = freshDatabase()
  const { employee, state: next } = registerEmployeeInState(
    state,
    input({ system_role: 'PM' }),
    credential,
  )
  assert(isPM(next, employee))
  assert(!isPM(next, employee, next.projects[0].project_id))
  assert(!canManageProject(next, employee, next.projects[0]))
  assert.deepEqual(visibleProjects(next, employee), [])
  const assigned = {
    ...next,
    members: [
      ...next.members,
      {
        member_id: 999,
        employee_id: employee.employee_id,
        project_id: next.projects[0].project_id,
        project_role: 'PM',
        assignment_start_date: '2026-01-02',
        assignment_end_date: null,
      },
    ],
  }
  assert(canManageProject(assigned, employee, assigned.projects[0]))
  assert(!canManageProject(assigned, employee, assigned.projects[1]))
})

test('fresh, logged-out and malformed sessions do not automatically log in', () => {
  const original = globalThis.sessionStorage
  let saved = null
  globalThis.sessionStorage = {
    getItem: () => saved,
    setItem: (_key, value) => {
      saved = value
    },
  }
  try {
    for (const value of [null, '', 'logout', 'NaN', '0', '-1', '1.5', '1e3', '9007199254740992']) {
      saved = value
      assert.equal(loadSessionUserId(), null)
    }
    persistSessionUserId(11)
    assert.equal(loadSessionUserId(), 11)
    persistSessionUserId(null)
    assert.equal(loadSessionUserId(), null)
  } finally {
    globalThis.sessionStorage = original
  }
})

test('new account credentials verify the password with a unique salt, without storing plaintext', async () => {
  const password = 'TestOnly123!'
  const saved = await makeCredential(password)
  assert.equal((await makeCredential(password, saved.salt)).hash, saved.hash)
  assert.notEqual((await makeCredential('WrongPassword', saved.salt)).hash, saved.hash)
  assert.notEqual((await makeCredential(password)).salt, saved.salt)
  assert(!JSON.stringify(saved).includes(password))
})
