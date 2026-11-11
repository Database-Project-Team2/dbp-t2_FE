import type { Database } from '../shared/model/entities'
import type { useDemoStore } from './useDemoStore'

export interface Credential {
  salt: string
  hash: string
}

export interface DemoState extends Database {
  version: 1
  credentials: Record<string, Credential>
}

export type DemoStore = ReturnType<typeof useDemoStore>
