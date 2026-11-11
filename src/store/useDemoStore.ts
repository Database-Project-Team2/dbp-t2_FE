import { useRef, useState } from 'react'
import {
  loadDemoState,
  persistDemoState,
  loadSessionUserId,
  persistSessionUserId,
} from './browserStorage'
import {
  saveProjectInState,
  saveMemberInState,
  saveEvaluationInState,
  recordWorkflowInState,
  saveClientInState,
} from './mutations'
import { freshDatabase, nextId } from './demoData'
import { makeCredential, requirePassword } from './credentials'
import { normalizeId, nextEmployeeNo } from '../shared/domain/employees'
import { today, validateDate } from '../shared/lib/date'
import type { Client, Employee, Evaluation, Member, Project } from '../shared/model/entities'
import type { DemoState } from './types'

/** React 상태와 저장소를 연결합니다. 업무 변경 규칙은 mutations.ts에 있습니다. */
export function useDemoStore() {
  const [db, setDb] = useState(loadDemoState)
  const stateRef = useRef(db)
  const [userId, setUserId] = useState<number | null>(loadSessionUserId)
  const user = db.employees.find((e) => e.employee_id === userId) || null
  function commit(next: DemoState) {
    persistDemoState(next)
    stateRef.current = next
    setDb(next)
  }
  function requireCurrentUser() {
    if (!user || user.employment_status === 'RESIGNED') throw new Error('로그인이 필요해요.')
    return user
  }
  function switchUser(id: number | null) {
    persistSessionUserId(id)
    setUserId(id)
  }
  async function login(loginId: string, password: string) {
    const employee = stateRef.current.employees.find(
      (e) => normalizeId(e.login_id) === normalizeId(loginId),
    )
    if (!employee || employee.employment_status === 'RESIGNED')
      throw new Error('로그인 ID 또는 비밀번호를 확인해 주세요.')
    const credential = stateRef.current.credentials[String(employee.employee_id)]
    const valid = credential
      ? (await makeCredential(password, credential.salt)).hash === credential.hash
      : password === 'demo1234' && employee.employee_id <= 10
    if (!valid) throw new Error('로그인 ID 또는 비밀번호를 확인해 주세요.')
    switchUser(employee.employee_id)
  }
  function isIdAvailable(loginId: string) {
    return (
      !!normalizeId(loginId) &&
      !stateRef.current.employees.some((e) => normalizeId(e.login_id) === normalizeId(loginId))
    )
  }
  async function register(
    input: Pick<
      Employee,
      | 'employee_name'
      | 'login_id'
      | 'education'
      | 'hire_date'
      | 'total_career_months'
      | 'skill_description'
      | 'job_category'
    >,
    password: string,
  ) {
    requirePassword(password)
    if (!input.employee_name.trim() || !input.education.trim())
      throw new Error('이름과 최종학력을 입력해 주세요.')
    if (!/^[a-zA-Z0-9._-]{3,100}$/.test(input.login_id))
      throw new Error('로그인 ID는 영문·숫자·마침표·밑줄·하이픈으로 3~100자 입력해 주세요.')
    validateDate(input.hire_date, '입사일')
    if (!Number.isInteger(input.total_career_months) || input.total_career_months < 0)
      throw new Error('총 경력은 0 이상의 개월 수로 입력해 주세요.')
    const credential = await makeCredential(password)
    const latest = stateRef.current
    if (!isIdAvailable(input.login_id)) throw new Error('이미 사용 중인 로그인 ID예요.')
    const employee: Employee = {
      ...input,
      employee_name: input.employee_name.trim(),
      login_id: normalizeId(input.login_id),
      employee_id: nextId(latest.employees.map((e) => e.employee_id)),
      employee_no: nextEmployeeNo(latest, input.hire_date),
      system_role: 'EMPLOYEE',
      employment_status: 'ACTIVE',
      resignation_date: null,
    }
    commit({
      ...latest,
      employees: [...latest.employees, employee],
      credentials: { ...latest.credentials, [employee.employee_id]: credential },
    })
    switchUser(employee.employee_id)
    return employee.employee_no
  }
  async function updateProfile(
    input: Pick<Employee, 'education' | 'total_career_months' | 'skill_description'>,
    password?: string,
  ) {
    const me = requireCurrentUser()
    if (!input.education.trim()) throw new Error('최종학력을 입력해 주세요.')
    if (!Number.isInteger(input.total_career_months) || input.total_career_months < 0)
      throw new Error('총 경력은 0 이상의 정수로 입력해 주세요.')
    if (password) requirePassword(password)
    const credential = password ? await makeCredential(password) : undefined
    const latest = stateRef.current
    commit({
      ...latest,
      employees: latest.employees.map((e) =>
        e.employee_id === me.employee_id ? { ...e, ...input } : e,
      ),
      credentials: credential
        ? { ...latest.credentials, [me.employee_id]: credential }
        : latest.credentials,
    })
  }
  function saveProject(input: Project) {
    const result = saveProjectInState(stateRef.current, requireCurrentUser(), input)
    commit(result.state)
    return result.projectId
  }
  function saveMember(input: Member) {
    commit(saveMemberInState(stateRef.current, requireCurrentUser(), input))
  }
  function saveEvaluation(input: Evaluation) {
    commit(saveEvaluationInState(stateRef.current, requireCurrentUser(), input))
  }
  function recordWorkflow(projectId: number, date: string) {
    commit(recordWorkflowInState(stateRef.current, requireCurrentUser(), projectId, date))
  }
  function saveClient(input: Client) {
    commit(saveClientInState(stateRef.current, requireCurrentUser(), input))
  }
  function reset() {
    commit(freshDatabase())
    switchUser(1)
  }
  return {
    db,
    user,
    switchUser,
    login,
    register,
    isIdAvailable,
    updateProfile,
    saveProject,
    saveMember,
    saveEvaluation,
    recordWorkflow,
    saveClient,
    reset,
    today: today(),
  }
}
