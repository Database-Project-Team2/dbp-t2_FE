import { execSync } from 'node:child_process'
import path from 'node:path'

export const API_BASE_URL = process.env.E2E_API_BASE_URL ?? 'http://localhost:8080'

/** 스크립트마다 DB를 시드 상태로 되돌립니다. 배포 서버는 E2E_RESET_CMD(예: ssh ... reset-db.sh)를 사용합니다. */
export function resetDatabase() {
  const command =
    process.env.E2E_RESET_CMD ??
    path.resolve(process.env.E2E_BACKEND_DIR ?? '../dbp-t2_BE', 'scripts/reset-db.sh')
  execSync(command, { stdio: 'pipe' })
}
