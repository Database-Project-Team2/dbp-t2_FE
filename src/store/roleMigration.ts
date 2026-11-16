import seed from '../data/seed.json' with { type: 'json' }
import type { DemoState } from './types.ts'

// 개발자가 시드에 준비한 경영진만 유지합니다. 가입 시 선택했던 예전 권한은 승계하지 않습니다.
const provisionedManagers = seed.employees.filter(
  (employee) => employee.system_role === 'MANAGEMENT',
)

export function migrateAccountRoles(state: DemoState): DemoState {
  return {
    ...state,
    employees: state.employees.map((employee) => ({
      ...employee,
      system_role: provisionedManagers.some(
        (manager) =>
          manager.employee_id === employee.employee_id && manager.login_id === employee.login_id,
      )
        ? 'MANAGEMENT'
        : 'EMPLOYEE',
    })),
  }
}
