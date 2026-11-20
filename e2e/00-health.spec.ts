import { expect, test } from '@playwright/test'
import { API_BASE_URL } from './support/env'

test('단계 0: 프론트 출처에서 백엔드 헬스체크를 호출한다', async ({ page }) => {
  await page.goto('/')
  const result = await page.evaluate(async (base) => {
    const response = await fetch(`${base}/actuator/health`)
    return { status: response.status, body: await response.json() }
  }, API_BASE_URL)
  expect(result.status).toBe(200)
  expect(result.body.status).toBe('UP')
})
