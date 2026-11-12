import { freshDatabase } from './demoData.ts'
import type { DemoState } from './types'

// 기존 데모 데이터를 계속 사용할 수 있도록 저장 키와 버전을 유지합니다.
const STORAGE_KEY = 'promp-workspace-demo-v1'
const SESSION_KEY = 'promp-workspace-session'

export function loadDemoState(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return freshDatabase()
    const saved = JSON.parse(raw)
    const tables = ['employees', 'clients', 'projects', 'members', 'evaluations']
    if (
      saved.version !== 1 ||
      !tables.every((table) => Array.isArray(saved[table])) ||
      !saved.employees.length
    ) {
      return freshDatabase()
    }
    return saved
  } catch {
    return freshDatabase()
  }
}

export function persistDemoState(state: DemoState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    throw new Error('브라우저 저장 공간이 부족하거나 차단되어 저장하지 못했어요.')
  }
}

export function loadSessionUserId(): number | null {
  const saved = sessionStorage.getItem(SESSION_KEY)
  if (!saved || !/^\d+$/.test(saved)) return null
  const id = Number(saved)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

export function persistSessionUserId(employeeId: number | null) {
  sessionStorage.setItem(SESSION_KEY, employeeId === null ? 'logout' : String(employeeId))
}
