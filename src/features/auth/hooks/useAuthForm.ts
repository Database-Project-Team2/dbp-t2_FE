import { useState } from 'react'
import type { FormEvent } from 'react'
import { go, type Notice } from '@/app/routing/navigation'
import { useStore } from '@/store/StoreContext'
import {
  loginIdError,
  signupErrors,
  type AuthValues,
  type AuthErrors,
} from '../model/authValidation'

/** 입력·필드별 검증을 관리하고, 저장은 store에 위임합니다. */
export function useAuthForm(signup: boolean, onNotice: Notice) {
  const { login, register, isIdAvailable, today } = useStore()
  const [values, setValues] = useState<AuthValues>({
    loginId: '',
    password: '',
    confirmation: '',
    name: '',
    residentNo: '',
    education: '',
    hire: today,
    months: '0',
    job: 'DEVELOPER',
    skills: '',
    role: '',
  })
  const [checkedId, setCheckedId] = useState('')
  const [idError, setIdError] = useState('')
  const [touched, setTouched] = useState<Partial<Record<keyof AuthValues, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const validation = signup
    ? signupErrors(values, checkedId)
    : {
        loginId: values.loginId.trim() ? '' : '로그인 ID를 입력해 주세요.',
        password: values.password ? '' : '비밀번호를 입력해 주세요.',
      }
  const errors: AuthErrors = {}
  for (const field of Object.keys(validation) as (keyof AuthValues)[]) {
    const live =
      (field === 'confirmation' && !!values.confirmation) ||
      (field === 'residentNo' && values.residentNo.replace('-', '').length === 13)
    if (submitted || touched[field] || live) errors[field] = validation[field]
  }
  if (idError) errors.loginId = idError

  function setField<Key extends keyof AuthValues>(key: Key, value: AuthValues[Key]) {
    setValues((previous) => ({ ...previous, [key]: value }))
    setError('')
    if (key === 'loginId') {
      setCheckedId('')
      setIdError('')
    }
  }
  function fieldProps(name: keyof AuthValues) {
    return {
      name,
      id: 'auth-' + name,
      onBlur: () => setTouched((previous) => ({ ...previous, [name]: true })),
      'aria-invalid': !!errors[name],
      'aria-describedby': errors[name] ? `auth-${name}-message` : undefined,
    }
  }
  function checkId() {
    const message =
      loginIdError(values.loginId) ||
      (isIdAvailable(values.loginId) ? '' : '이미 사용 중인 ID예요.')
    setIdError(message)
    setCheckedId(message ? '' : values.loginId)
    setTouched((previous) => ({ ...previous, loginId: true }))
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setSubmitted(true)
    setError('')
    const firstInvalid = (Object.keys(validation) as (keyof AuthValues)[]).find(
      (field) => validation[field],
    )
    if (firstInvalid) {
      event.currentTarget.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus()
      return
    }
    setBusy(true)
    try {
      if (signup && values.role) {
        const employeeNo = await register(
          {
            employee_name: values.name,
            login_id: values.loginId,
            education: values.education,
            hire_date: values.hire,
            total_career_months: Number(values.months),
            skill_description: values.skills || null,
            job_category: values.job,
            system_role: values.role,
            resident_no: values.residentNo,
          },
          values.password,
        )
        onNotice(`가입이 완료됐어요. 새 사번은 ${employeeNo}예요.`)
      } else await login(values.loginId, values.password)
      go('dashboard')
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return {
    values,
    setField,
    fieldProps,
    errors,
    checkedId,
    checkId,
    error,
    busy,
    today,
    handleSubmit,
  }
}
export type AuthFormState = ReturnType<typeof useAuthForm>
