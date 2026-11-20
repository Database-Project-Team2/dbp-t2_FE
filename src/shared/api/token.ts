// 로그인 상태는 탭 단위로 유지합니다. 서버는 토큰을 폐기하지 않으므로 삭제가 곧 로그아웃입니다.
const TOKEN_KEY = 'promp-workspace-token'

export function loadToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function saveToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // 저장소가 막혀 있어도 로그아웃은 계속 진행합니다.
  }
}
