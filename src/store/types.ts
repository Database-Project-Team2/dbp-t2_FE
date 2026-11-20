// 목업(브라우저 저장) 전용 타입입니다. 앱은 서버 API를 사용하며, 이 폴더는 기존 업무 규칙 테스트에서만 사용합니다.
import type { Database } from '../shared/model/entities'

export interface Credential {
  salt: string
  hash: string
}

export interface DemoState extends Database {
  version: 1
  credentials: Record<string, Credential>
}
