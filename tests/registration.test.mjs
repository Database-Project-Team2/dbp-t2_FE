import test from 'node:test'
import assert from 'node:assert/strict'
import { residentNumberError, maskResidentNumber } from '../src/shared/domain/residentNumber.ts'
import { signupErrors } from '../src/features/auth/model/authValidation.ts'
import { EDUCATIONS, normalizeEducation } from '../src/shared/model/employeeOptions.ts'

// 형식 검사 전용 합성 입력이며 실제 사람의 개인정보를 사용하지 않습니다.
const formValues = (overrides = {}) => ({
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

test('signup requires education, ID check and matching passwords without choosing a role', () => {
  assert.deepEqual(signupErrors(formValues(), 'new.employee'), {})
  const errors = signupErrors(formValues({ education: '', confirmation: 'different' }), '')
  assert.equal(errors.role, undefined)
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

test('signup validates education, hire date and career length', () => {
  for (const education of EDUCATIONS)
    assert.deepEqual(signupErrors(formValues({ education }), 'new.employee'), {})
  for (const [field, value] of [
    ['education', '임의 학력'],
    ['hire', '2026-02-30'],
    ['months', '-1'],
    ['months', '1.5'],
  ]) {
    assert.ok(signupErrors(formValues({ [field]: value }), 'new.employee')[field])
  }
  assert.equal(normalizeEducation('대학교 졸업'), '대졸(학사)')
})
