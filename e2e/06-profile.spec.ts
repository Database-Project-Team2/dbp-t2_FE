import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { resetDatabase } from './support/env'
import { login, selectOption } from './support/ui'

test.beforeAll(() => resetDatabase())

test('단계 5: 프로필 수정 → 비밀번호 변경 후 로그인 화면 → 새 비밀번호로 로그인', async ({
  page,
}) => {
  await login(page, 'demo04')
  await page.goto('/#/profile')
  await expect(page.getByText('프로젝트 경력 2건')).toBeVisible()
  await page.getByRole('button', { name: '프로필 수정' }).click()
  const form = page.getByRole('dialog', { name: '내 정보 수정' })
  await selectOption(page, '최종학력', '석사')
  await form.getByLabel('총 경력 (개월)').fill('48')
  await form.getByLabel('기술과 경험').fill('Kotlin, Spring, 테스트 자동화')
  await form.getByRole('button', { name: '변경 사항 저장' }).click()
  await expect(form).toBeHidden()
  await expect(page.getByText('Kotlin, Spring, 테스트 자동화')).toBeVisible()
  await expect(page.getByText('4년', { exact: false }).first()).toBeVisible()

  await page.getByRole('button', { name: '프로필 수정' }).click()
  await form.getByLabel('새 비밀번호', { exact: true }).fill('Changed123!')
  await form.getByLabel('새 비밀번호 확인', { exact: true }).fill('Changed123!')
  await form.getByRole('button', { name: '변경 사항 저장' }).click()
  await expect(form.getByRole('alert')).toContainText('현재 비밀번호를 입력해 주세요')
  await form.getByLabel('현재 비밀번호', { exact: true }).fill('wrong-pass')
  await form.getByRole('button', { name: '변경 사항 저장' }).click()
  await expect(form.getByRole('alert')).toContainText('현재 비밀번호가 맞지 않아요')
  await form.getByLabel('현재 비밀번호', { exact: true }).fill('demo1234')
  await form.getByRole('button', { name: '변경 사항 저장' }).click()
  await expect(page.getByRole('button', { name: '로그인', exact: true })).toBeVisible()
  await expect(
    page.evaluate(() => sessionStorage.getItem('promp-workspace-token')),
  ).resolves.toBeNull()

  await login(page, 'demo04', 'Changed123!')
})

test('단계 5: 경영진은 직원 경력 CSV와 투입 이력 CSV를 서버에서 받는다', async ({ page }) => {
  await login(page, 'demo01')
  await page
    .getByRole('navigation', { name: '주 메뉴' })
    .getByRole('link', { name: '직원' })
    .click()
  await page.getByRole('button', { name: '장예린 상세 보기' }).click()
  const dialog = page.getByRole('dialog', { name: '직원 상세' })
  await expect(dialog.getByText('프로젝트 경력 3건')).toBeVisible()
  await expect(dialog.getByText('평가 기초자료')).toBeVisible()
  const [career] = await Promise.all([
    page.waitForEvent('download'),
    dialog.getByRole('button', { name: 'CSV 내보내기' }).click(),
  ])
  expect(career.suggestedFilename()).toBe('장예린_경력기초자료.csv')
  const careerFile = test.info().outputPath('career.csv')
  await career.saveAs(careerFile)
  expect(readFileSync(careerFile, 'utf8').trim().split('\r\n')).toHaveLength(4)
  await page.keyboard.press('Escape')

  await page
    .getByRole('navigation', { name: '주 메뉴' })
    .getByRole('link', { name: '투입 이력' })
    .click()
  await page.getByText('날짜로 상세 검색').click()
  await page.getByLabel('과거 투입 기준일', { exact: true }).fill('2026-05-01')
  await expect(page.locator('tbody tr')).toHaveCount(5)
  const [history] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'CSV 내보내기' }).click(),
  ])
  const historyFile = test.info().outputPath('history.csv')
  await history.saveAs(historyFile)
  const csv = readFileSync(historyFile, 'utf8')
  expect(csv.startsWith('﻿')).toBe(true)
  expect(csv.trim().split('\r\n')).toHaveLength(6)
})
