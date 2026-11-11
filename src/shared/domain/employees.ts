import { assert } from '../lib/assert.ts'
import type { Database } from '../model/entities.ts'

export const normalizeId = (id: string) => id.trim().normalize('NFC').toLowerCase()

export function nextEmployeeNo(db: Database, hireDate: string) {
  const year = hireDate.slice(0, 4)
  const sequence =
    Math.max(
      0,
      ...db.employees
        .filter((employee) => employee.employee_no.startsWith(year))
        .map((employee) => Number(employee.employee_no.slice(4))),
    ) + 1
  assert(sequence <= 9999, '해당 연도의 사번 발급 한도를 초과했어요.')
  return year + String(sequence).padStart(4, '0')
}
