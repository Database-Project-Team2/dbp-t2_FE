import { expect, type Page } from '@playwright/test'

export const PASSWORD = 'demo1234'

/** 서버 기준일과 같은 Asia/Seoul의 오늘. */
export const seoulToday = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

export async function selectOption(page: Page, label: string, option: string) {
  await page.getByRole('combobox', { name: label }).click()
  await page.getByRole('option', { name: option, exact: true }).click()
}

export async function login(page: Page, loginId: string, password = PASSWORD) {
  await page.goto('/')
  await page.getByLabel('로그인 ID').fill(loginId)
  await page.getByLabel('비밀번호', { exact: true }).fill(password)
  await page.getByRole('button', { name: '로그인', exact: true }).click()
  await expect(page.getByLabel('계정 메뉴')).toBeVisible()
}

export async function logout(page: Page) {
  await page.getByLabel('계정 메뉴').click()
  await page.getByRole('button', { name: '로그아웃' }).click()
  await expect(page.getByRole('button', { name: '로그인', exact: true })).toBeVisible()
}

/** Asia/Seoul 기준 오늘에서 days만큼 더한 날짜. */
export const seoulDate = (days: number) => {
  const date = new Date(`${seoulToday()}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export const dotted = (date: string) => date.replaceAll('-', '.')
