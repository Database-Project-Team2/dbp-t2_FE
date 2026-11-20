import { createContext, useContext } from 'react'
import type { RegistrationRequest } from '@/shared/api/auth'
import type { Employee } from '@/shared/model/entities'

export interface SessionState {
  user: Employee | null
  /** 현재 PM 배정 여부. 표시용이며 권한 판단은 서버가 합니다. */
  isPm: boolean
  /** 서버 기준일(Asia/Seoul). 기준일 입력의 기본값입니다. */
  today: string
  ready: boolean
  login: (loginId: string, password: string) => Promise<void>
  register: (input: RegistrationRequest) => Promise<string>
  checkLoginId: (loginId: string) => Promise<boolean>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

export const SessionContext = createContext<SessionState | null>(null)

export function useSession() {
  const session = useContext(SessionContext)
  if (!session) throw new Error('SessionProvider is missing')
  return session
}
