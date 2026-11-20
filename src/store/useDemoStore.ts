import { useEffect, useMemo, useRef, useState } from 'react'
import { loadDemoState, persistDemoState } from './browserStorage'
import {
  saveProjectInState,
  saveMemberInState,
  removeMemberInState,
  saveEvaluationInState,
  recordWorkflowInState,
  saveClientInState,
} from './mutations'
import { EDUCATIONS } from '../shared/model/employeeOptions'
import { makeCredential, requirePassword } from './credentials'
import { useSession } from '../app/session/SessionContext'
import type { Client, Employee, Evaluation, Member, Project } from '../shared/model/entities'
import type { DemoState } from './types'

/** 서버 로그인 사용자를 목업 데이터에 같은 employee_id로 넣어 아직 전환하지 않은 화면이 동작하게 합니다. */
function withSessionUser(state: DemoState, user: Employee | null): DemoState {
  if (!user) return state
  const exists = state.employees.some((employee) => employee.employee_id === user.employee_id)
  return {
    ...state,
    employees: exists
      ? state.employees.map((employee) =>
          employee.employee_id === user.employee_id ? { ...employee, ...user } : employee,
        )
      : [...state.employees, user],
  }
}

/** React 상태와 저장소를 연결합니다. 업무 변경 규칙은 mutations.ts에 있습니다. */
export function useDemoStore() {
  const session = useSession()
  const [saved, setSaved] = useState(loadDemoState)
  const db = useMemo(() => withSessionUser(saved, session.user), [saved, session.user])
  const stateRef = useRef(db)
  useEffect(() => {
    stateRef.current = db
  }, [db])
  const user = session.user
  function commit(next: DemoState) {
    persistDemoState(next)
    stateRef.current = next
    setSaved(next)
  }
  function requireCurrentUser() {
    if (!user || user.employment_status === 'RESIGNED') throw new Error('로그인이 필요해요.')
    return user
  }
  async function updateProfile(
    input: Pick<Employee, 'education' | 'total_career_months' | 'skill_description'>,
    password?: string,
  ) {
    const me = requireCurrentUser()
    if (!EDUCATIONS.some((value) => value === input.education))
      throw new Error('최종학력을 선택해 주세요.')
    if (!Number.isInteger(input.total_career_months) || input.total_career_months < 0)
      throw new Error('총 경력은 0 이상의 정수로 입력해 주세요.')
    if (password) requirePassword(password)
    const credential = password ? await makeCredential(password) : undefined
    const latest = stateRef.current
    commit({
      ...latest,
      employees: latest.employees.map((e) =>
        e.employee_id === me.employee_id
          ? {
              ...e,
              education: input.education,
              total_career_months: input.total_career_months,
              skill_description: input.skill_description?.trim() || null,
            }
          : e,
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
  function removeMember(memberId: number) {
    commit(removeMemberInState(stateRef.current, requireCurrentUser(), memberId))
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
  return {
    db,
    user,
    updateProfile,
    saveProject,
    saveMember,
    removeMember,
    saveEvaluation,
    recordWorkflow,
    saveClient,
    today: session.today,
  }
}
