import { defineConfig } from '@playwright/test'

// 로컬: Spring(8080) + Vite(5173)를 띄워 실행합니다. 배포 서버 기준 실행은 E2E_API_BASE_URL을 지정하세요.
const remoteApi = process.env.E2E_API_BASE_URL
const apiBaseUrl = remoteApi ?? 'http://localhost:8080'
const backendDir = process.env.E2E_BACKEND_DIR ?? '../dbp-t2_BE'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    viewport: { width: 1400, height: 900 },
    trace: 'retain-on-failure',
  },
  webServer: [
    ...(remoteApi
      ? []
      : [
          {
            command: './gradlew bootRun --console=plain',
            cwd: backendDir,
            url: 'http://localhost:8080/actuator/health',
            reuseExistingServer: true,
            timeout: 180_000,
          },
        ]),
    {
      command: 'npm run dev -- --port 5173 --strictPort',
      url: 'http://localhost:5173',
      reuseExistingServer: !remoteApi,
      env: { VITE_API_BASE_URL: apiBaseUrl },
      timeout: 60_000,
    },
  ],
})
