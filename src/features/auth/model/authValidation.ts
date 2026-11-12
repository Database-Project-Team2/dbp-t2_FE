import { residentNumberError } from '../../../shared/domain/residentNumber.ts'
import { ACCOUNT_ROLES, EDUCATIONS } from '../../../shared/model/employeeOptions.ts'
import type { Job, SystemRole } from '../../../shared/model/entities.ts'
import { validateDate } from '../../../shared/lib/date.ts'

export interface AuthValues {
  loginId: string
  password: string
  confirmation: string
  name: string
  residentNo: string
  education: string
  hire: string
  months: string
  job: Job
  skills: string
  role: SystemRole | ''
}

export type AuthErrors = Partial<Record<keyof AuthValues, string>>
export const loginIdError = (id: string) =>
  /^[a-zA-Z0-9._-]{3,100}$/.test(id) ? '' : '영문·숫자·마침표·밑줄·하이픈 3~100자로 입력해 주세요.'

export function signupErrors(values: AuthValues, checkedId: string): AuthErrors {
  const errors: AuthErrors = {}
  if (!Object.hasOwn(ACCOUNT_ROLES, values.role)) errors.role = '가입 유형을 선택해 주세요.'
  if (loginIdError(values.loginId)) errors.loginId = loginIdError(values.loginId)
  else if (checkedId !== values.loginId) errors.loginId = '로그인 ID 중복 확인을 해주세요.'
  if (values.password.length < 8) errors.password = '비밀번호를 8자 이상 입력해 주세요.'
  if (!values.confirmation) errors.confirmation = '비밀번호를 한 번 더 입력해 주세요.'
  else if (values.password !== values.confirmation)
    errors.confirmation = '비밀번호가 일치하지 않아요.'
  if (!values.name.trim()) errors.name = '직원 이름을 입력해 주세요.'
  const residentError = residentNumberError(values.residentNo)
  if (residentError) errors.residentNo = residentError
  if (!EDUCATIONS.some((value) => value === values.education))
    errors.education = '최종학력을 선택해 주세요.'
  try {
    validateDate(values.hire, '입사일')
  } catch (error) {
    errors.hire = (error as Error).message
  }
  if (!values.months || !Number.isInteger(Number(values.months)) || Number(values.months) < 0)
    errors.months = '총 경력은 0 이상의 정수로 입력해 주세요.'
  return errors
}
