import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { resetDatabase } from './support/env'
import { login, selectOption } from './support/ui'

test.beforeAll(() => resetDatabase())

test('장면 5: 평가 검색 → CSV 다운로드 → 한빛유통 담당자 수정 → 프로젝트 1 고객평가 상세에 새 담당자', async ({
  page,
}) => {
  await login(page, 'demo01')
  await page
    .getByRole('navigation', { name: '주 메뉴' })
    .getByRole('link', { name: '평가' })
    .click()
  await page.getByLabel('피평가 직원 검색').fill('이서연')
  await expect(page.locator('tbody tr')).toHaveCount(7)

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'CSV 내보내기' }).click(),
  ])
  expect(download.suggestedFilename()).toBe('평가결과.csv')
  const file = test.info().outputPath('evaluations.csv')
  await download.saveAs(file)
  const csv = readFileSync(file, 'utf8')
  expect(csv.startsWith('﻿')).toBe(true)
  expect(csv).toContain('업무수행 의견')
  expect(csv.trim().split('\r\n')).toHaveLength(8)

  await page
    .getByRole('navigation', { name: '주 메뉴' })
    .getByRole('link', { name: '발주처' })
    .click()
  const card = page.locator('article', {
    has: page.getByRole('heading', { name: '가상 한빛유통' }),
  })
  await card.getByRole('button', { name: '정보 수정' }).click()
  const form = page.getByRole('dialog', { name: '발주처 정보 수정' })
  await form.getByLabel('담당자명').fill('한새담당')
  await form.getByRole('button', { name: '저장하기' }).click()
  await expect(form).toBeHidden()
  await expect(card).toContainText('한새담당 담당자')

  await page.goto('/#/projects/1')
  await expect(page.getByText('한새담당 담당자')).toBeVisible()
  await page
    .getByRole('navigation', { name: '주 메뉴' })
    .getByRole('link', { name: '평가' })
    .click()
  await selectOption(page, '평가 프로젝트', '유통 재고관리 시스템')
  await selectOption(page, '평가유형 필터', '고객평가')
  await expect(page.locator('tbody tr')).toHaveCount(5)
  await page.locator('tbody tr').first().getByRole('button', { name: '의견 보기' }).click()
  const detail = page.getByRole('dialog', { name: '평가 상세' })
  await expect(detail.getByText('실제 평가자 (현재 담당자)')).toBeVisible()
  await expect(detail.getByText('한새담당')).toBeVisible()
})

test('장면 5 보강: 일반 직원의 평가 결과와 CSV에는 의견이 없다', async ({ page }) => {
  await login(page, 'demo04')
  await page
    .getByRole('navigation', { name: '주 메뉴' })
    .getByRole('link', { name: '평가' })
    .click()
  await expect(page.locator('tbody tr').first()).toContainText('점수만 공개')
  await expect(page.getByRole('button', { name: '의견 보기' })).toHaveCount(0)
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'CSV 내보내기' }).click(),
  ])
  const file = test.info().outputPath('employee.csv')
  await download.saveAs(file)
  const csv = readFileSync(file, 'utf8')
  expect(csv).not.toContain('의견')
  expect(csv).not.toContain('연구 데이터 관리 시스템')
})
