import seed from '../data/seed.json' with { type: 'json' }
import type { Database } from '../shared/model/entities.ts'
import type { DemoState } from './types.ts'

/** 원본 시드를 수정하지 않도록 새 데모 상태를 복제합니다. */
export function freshDatabase(): DemoState {
  return { ...(structuredClone(seed) as Database), version: 1, credentials: {} }
}

/** 로컬 데모 전용 ID 발급. 실제 서버에서는 DB가 발급해야 합니다. */
export const nextId = (ids: number[]) => Math.max(0, ...ids) + 1
