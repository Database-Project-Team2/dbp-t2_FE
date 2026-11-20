import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi, type RegistrationRequest, type Session } from '@/shared/api/auth'
import { onUnauthorized } from '@/shared/api/client'
import { clearToken, loadToken, saveToken } from '@/shared/api/token'
import { today as browserToday } from '@/shared/lib/date'
import { SessionContext, type SessionState } from './SessionContext'

/** 로그인 상태는 서버 토큰으로 관리합니다. 앱 시작 시 토큰이 있으면 /auth/me로 복원합니다. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(() => !loadToken())

  const signOut = useCallback(() => {
    clearToken()
    setSession(null)
  }, [])

  const refresh = useCallback(async () => {
    setSession(await authApi.me())
  }, [])

  useEffect(() => onUnauthorized(() => setSession(null)), [])

  useEffect(() => {
    if (!loadToken()) return
    authApi
      .me()
      .then(setSession)
      .catch(signOut)
      .finally(() => setReady(true))
  }, [signOut])

  const value = useMemo<SessionState>(
    () => ({
      user: session?.employee ?? null,
      isPm: session?.is_pm ?? false,
      today: session?.server_today ?? browserToday(),
      ready,
      async login(loginId, password) {
        const result = await authApi.login(loginId.trim(), password)
        saveToken(result.access_token)
        setSession(result)
      },
      async register(input: RegistrationRequest) {
        const result = await authApi.register(input)
        saveToken(result.access_token)
        setSession(result)
        return result.employee.employee_no
      },
      async checkLoginId(loginId) {
        return (await authApi.checkLoginId(loginId)).available
      },
      async logout() {
        // 서버는 토큰을 폐기하지 않습니다. 호출 실패와 무관하게 토큰을 지웁니다.
        await authApi.logout().catch(() => undefined)
        signOut()
      },
      refresh,
    }),
    [session, ready, signOut, refresh],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
