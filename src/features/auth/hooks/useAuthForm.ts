import { useState } from 'react'
import type { FormEvent } from 'react'
import { go } from '@/app/routing/navigation'
import { useStore } from '@/store/StoreContext'
import type { Job } from '@/shared/model/entities'
import type { Notice } from '@/app/routing/navigation'

/** 입력 상태와 로그인·회원가입 검증을 관리합니다. UI는 AuthForm에서 조립합니다. */
export function useAuthForm(signup: boolean, onNotice: Notice) {
  const { login, register, isIdAvailable, today } = useStore()
  const [values, setValues] = useState({
    loginId: '',
    password: '',
    confirmation: '',
    name: '',
    education: '대학교 졸업',
    hire: today,
    months: '0',
    job: 'DEVELOPER' as Job,
    skills: '',
  })
  const [checkedId, setCheckedId] = useState('')
  const [idMessage, setIdMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  function setField<Key extends keyof typeof values>(key: Key, value: (typeof values)[Key]) {
    setValues((previous) => ({ ...previous, [key]: value }))
    if (key === 'loginId') {
      setCheckedId('')
      setIdMessage('')
    }
  }
  function checkId() {
    if (!/^[a-zA-Z0-9._-]{3,100}$/.test(values.loginId)) {
      setIdMessage('영문·숫자·마침표·밑줄·하이픈 3~100자로 입력하세요.')
      return
    }
    const available = isIdAvailable(values.loginId)
    setCheckedId(available ? values.loginId : '')
    setIdMessage(available ? '사용할 수 있는 ID예요.' : '이미 사용 중인 ID예요.')
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (signup && (checkedId !== values.loginId || !isIdAvailable(values.loginId))) {
      setError('로그인 ID 중복 확인을 해주세요.')
      return
    }
    if (signup && values.password !== values.confirmation) {
      setError('비밀번호가 서로 달라요.')
      return
    }
    setBusy(true)
    try {
      if (signup) {
        const employeeNo = await register(
          {
            employee_name: values.name,
            login_id: values.loginId,
            education: values.education,
            hire_date: values.hire,
            total_career_months: Number(values.months),
            skill_description: values.skills || null,
            job_category: values.job,
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
  return { values, setField, checkId, idMessage, error, busy, today, handleSubmit }
}
export type AuthFormState = ReturnType<typeof useAuthForm>
