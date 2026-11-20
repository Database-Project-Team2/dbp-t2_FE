import { expect, test, type Page } from '@playwright/test'
import { resetDatabase } from './support/env'
import { login, logout } from './support/ui'

test.beforeAll(() => resetDatabase())

const stat = (page: Page, label: string) =>
  page.locator('article', { has: page.getByText(label, { exact: true }) }).locator('strong')

test('장면 2: 경영진 대시보드 수치 → 기준일 2026-05-01 → 같은 날짜 투입 이력 → Java 직원 검색', async ({
  page,
}) => {
  await login(page, 'demo01')

  await expect(stat(page, '진행 중 프로젝트')).toHaveText(/^1\s*개$/)
  await expect(stat(page, '참여 프로젝트가 없는 직원')).toHaveText(/^5\s*명$/)
  await expect(stat(page, '고객평가 보고 대기')).toHaveText(/^2\s*건$/)
  await expect(page.getByRole('heading', { name: '교육 콘텐츠 관리 시스템' })).toBeVisible()

  await page.getByLabel('현황 기준일', { exact: true }).fill('2026-05-01')
  await expect(
    page.getByText('2026.05.01 시점의 진행 프로젝트와 투입 인원을 조회 중이에요.'),
  ).toBeVisible()
  await expect(stat(page, '당시 진행 프로젝트')).toHaveText(/^1\s*개$/)
  const ongoing = page.locator('section', {
    has: page.getByRole('heading', { name: /당시 진행 프로젝트/ }),
  })
  await expect(ongoing.getByRole('heading', { name: '연구 데이터 관리 시스템' })).toBeVisible()
  await expect(ongoing.getByRole('heading', { name: '교육 콘텐츠 관리 시스템' })).toHaveCount(0)

  await page.getByRole('link', { name: '투입 이력' }).click()
  await page.getByText('날짜로 상세 검색').click()
  await page.getByLabel('과거 투입 기준일', { exact: true }).fill('2026-05-01')
  await expect(page.getByText('2026.05.01 기준')).toBeVisible()
  const rows = page.locator('tbody tr')
  await expect(rows).toHaveCount(5)
  for (const name of ['정도윤', '강하린', '윤서준', '장예린', '한지민']) {
    await expect(rows.filter({ hasText: name })).toHaveCount(1)
  }
  await expect(rows.filter({ hasText: '연구 데이터 관리 시스템' })).toHaveCount(5)

  await page.getByRole('link', { name: '직원' }).click()
  await page.getByText('상세 검색').first().click()
  await page.getByPlaceholder('예: Java, SQL (모두 포함)').fill('Java')
  await expect(page.locator('tbody tr')).toHaveCount(9)
  await expect(page.locator('tbody tr').filter({ hasText: '임현우' })).toHaveCount(0)
  await page.getByPlaceholder('예: Java, SQL (모두 포함)').fill('Java, Python')
  await expect(page.locator('tbody tr')).toHaveCount(0)
})

test('장면 2 보강: 일반 직원(demo03)은 소속 프로젝트만 보고 경영진 메뉴는 없다', async ({
  page,
}) => {
  await login(page, 'demo03')
  const nav = page.getByRole('navigation', { name: '주 메뉴' })
  await expect(nav.getByRole('link', { name: '직원' })).toHaveCount(0)
  await expect(nav.getByRole('link', { name: '투입 이력' })).toHaveCount(0)

  await nav.getByRole('link', { name: '프로젝트' }).click()
  await expect(page.getByText(/총 2개 프로젝트/)).toBeVisible()
  await expect(page.getByRole('heading', { name: '유통 재고관리 시스템' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '유통 분석 대시보드' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '교육 콘텐츠 관리 시스템' })).toHaveCount(0)

  await page.goto('/#/projects/3')
  await expect(page.getByText('프로젝트를 볼 수 없어요')).toBeVisible()

  await nav.getByRole('link', { name: '발주처' }).click()
  await expect(page.getByRole('heading', { name: '가상 한빛유통' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '가상 미래연구소' })).toHaveCount(0)

  await nav.getByRole('link', { name: '업무 현황' }).click()
  await expect(stat(page, '작성할 평가')).toHaveText(/^6\s*건$/)
  await logout(page)
})
