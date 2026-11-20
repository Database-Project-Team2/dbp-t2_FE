import { expect, test } from '@playwright/test'
import { resetDatabase } from './support/env'
import { NEWBIE, apiContext } from './support/scenario'
import { login, logout, seoulToday, selectOption } from './support/ui'

test.beforeAll(() => resetDatabase())

test('장면 1: 회원가입 → 사번 확인 → 대소문자만 바꾼 ID 차단 → 로그아웃 → demo01 로그인', async ({
  page,
}) => {
  const expectedNo = `${seoulToday().slice(0, 4)}0001`

  await page.goto('/')
  await page.getByRole('button', { name: '직원 회원가입' }).click()
  await page.getByLabel('로그인 ID').fill(NEWBIE.login_id)
  await page.getByRole('button', { name: '중복 확인' }).click()
  await expect(page.getByText('사용할 수 있는 ID예요.')).toBeVisible()
  await page.getByLabel('비밀번호', { exact: true }).fill(NEWBIE.password)
  await page.getByLabel('비밀번호 확인', { exact: true }).fill(NEWBIE.password)
  await page.getByLabel('직원 이름').fill(NEWBIE.employee_name)
  await page.getByLabel('주민등록번호 앞 6자리').fill(NEWBIE.resident_no.slice(0, 6))
  await page.getByLabel('주민등록번호 뒤 7자리').fill(NEWBIE.resident_no.slice(7))
  await selectOption(page, '최종학력', NEWBIE.education)
  await page.getByLabel('총 경력 (개월)').fill(String(NEWBIE.total_career_months))
  await page.getByLabel('보유 기술과 경험 (선택)').fill(NEWBIE.skill_description)
  await page.getByRole('button', { name: '회원가입', exact: true }).click()

  // 가입 완료 안내와 계정 메뉴에 서버가 발급한 사번이 보인다.
  await expect(page.getByRole('status')).toContainText(`새 사번은 ${expectedNo}`)
  await page.getByLabel('계정 메뉴').click()
  await expect(page.locator('details').getByText(expectedNo, { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await logout(page)

  // 대소문자만 바꾼 ID는 화면의 중복 확인과 서버 가입 모두에서 막힌다.
  await page.getByRole('button', { name: '직원 회원가입' }).click()
  await page.getByLabel('로그인 ID').fill('Scene.NEWBIE')
  await page.getByRole('button', { name: '중복 확인' }).click()
  await expect(page.getByText('이미 사용 중인 ID예요.')).toBeVisible()
  const api = await apiContext()
  const duplicate = await api.post('employees', {
    data: { ...NEWBIE, login_id: 'SCENE.Newbie', hire_date: seoulToday() },
  })
  expect(duplicate.status()).toBe(409)
  expect((await duplicate.json()).error.code).toBe('LOGIN_ID_DUPLICATED')
  await api.dispose()

  await login(page, 'demo01')
  await expect(page.getByLabel('계정 메뉴')).toContainText('김민준')
})

test('장면 1 보강: 토큰이 남아 있으면 새로고침 후에도 로그인 상태를 /auth/me로 복원한다', async ({
  page,
}) => {
  await login(page, 'demo03')
  await page.reload()
  await expect(page.getByLabel('계정 메뉴')).toContainText('박지훈')
  // 토큰이 깨지면 401 → 로그인 화면으로 돌아간다.
  await page.evaluate(() => sessionStorage.setItem('promp-workspace-token', 'broken'))
  await page.reload()
  await expect(page.getByRole('button', { name: '로그인', exact: true })).toBeVisible()
})
