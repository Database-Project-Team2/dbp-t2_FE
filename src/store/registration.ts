import { assert } from '../shared/lib/assert.ts'
import { validateDate } from '../shared/lib/date.ts'
import { nextEmployeeNo, normalizeId } from '../shared/domain/employees.ts'
import { maskResidentNumber, residentNumberError } from '../shared/domain/residentNumber.ts'
import { JOBS } from '../shared/model/labels.ts'
import { ACCOUNT_ROLES, EDUCATIONS } from '../shared/model/employeeOptions.ts'
import type { Employee } from '../shared/model/entities.ts'
import type { Credential, DemoState } from './types.ts'
import { nextId } from './demoData.ts'

export type RegistrationInput = Pick<
  Employee,
  | 'employee_name'
  | 'login_id'
  | 'education'
  | 'hire_date'
  | 'total_career_months'
  | 'skill_description'
  | 'job_category'
  | 'system_role'
> & { resident_no: string }

export function validateRegistration(input: RegistrationInput) {
  assert(input.employee_name.trim(), '직원 이름을 입력해 주세요.')
  assert(
    /^[a-zA-Z0-9._-]{3,100}$/.test(input.login_id),
    '로그인 ID는 영문·숫자·마침표·밑줄·하이픈으로 3~100자 입력해 주세요.',
  )
  assert(
    EDUCATIONS.some((value) => value === input.education),
    '최종학력을 선택해 주세요.',
  )
  assert(Object.hasOwn(ACCOUNT_ROLES, input.system_role), '가입 유형을 선택해 주세요.')
  assert(Object.hasOwn(JOBS, input.job_category), '직군을 선택해 주세요.')
  const residentError = residentNumberError(input.resident_no)
  assert(!residentError, residentError)
  validateDate(input.hire_date, '입사일')
  assert(
    Number.isInteger(input.total_career_months) && input.total_career_months >= 0,
    '총 경력은 0 이상의 개월 수로 입력해 주세요.',
  )
}

export function registerEmployeeInState(
  state: DemoState,
  input: RegistrationInput,
  credential: Credential,
) {
  validateRegistration(input)
  const loginId = normalizeId(input.login_id)
  assert(
    !state.employees.some((employee) => normalizeId(employee.login_id) === loginId),
    '이미 사용 중인 로그인 ID예요.',
  )
  // 주민번호 원문은 폼에서만 사용합니다. 브라우저 저장소에는 마스킹된 값만 남깁니다.
  const employee: Employee = {
    employee_id: nextId(state.employees.map((employee) => employee.employee_id)),
    employee_no: nextEmployeeNo(state, input.hire_date),
    employee_name: input.employee_name.trim(),
    login_id: loginId,
    education: input.education,
    hire_date: input.hire_date,
    total_career_months: input.total_career_months,
    skill_description: input.skill_description?.trim() || null,
    job_category: input.job_category,
    system_role: input.system_role,
    employment_status: 'ACTIVE',
    resignation_date: null,
    resident_no_masked: maskResidentNumber(input.resident_no),
  }
  return {
    employee,
    state: {
      ...state,
      employees: [...state.employees, employee],
      credentials: { ...state.credentials, [employee.employee_id]: credential },
    },
  }
}
