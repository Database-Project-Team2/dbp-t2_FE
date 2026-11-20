import { expect, test, type Page } from '@playwright/test'
import { resetDatabase } from './support/env'
import { NEWBIE, NEW_PROJECT, apiContext, apiLogin, registerNewbie } from './support/scenario'
import { dotted, login, seoulDate, seoulToday, selectOption } from './support/ui'

let newbieId = 0
test.beforeAll(async () => {
  resetDatabase()
  newbieId = await registerNewbie(seoulToday())
})

async function openAddMember(page: Page, search: string) {
  await page.getByRole('button', { name: '구성원 추가' }).click()
  const dialog = page.getByRole('dialog', { name: '프로젝트 구성원 추가' })
  await dialog.getByPlaceholder('이름 또는 사번').fill(search)
  return dialog
}

test('장면 3: 프로젝트 등록 → PM·신규 직원 배치 → 409·422·휴직자 차단 → 종료와 종료일 기록', async ({
  page,
}) => {
  const today = seoulToday()
  await login(page, 'demo01')
  await page
    .getByRole('navigation', { name: '주 메뉴' })
    .getByRole('link', { name: '프로젝트' })
    .click()
  await page.getByRole('button', { name: '프로젝트 등록' }).click()
  const form = page.getByRole('dialog', { name: '새 프로젝트 등록' })
  await form.getByLabel('프로젝트명').fill(NEW_PROJECT)
  await selectOption(page, '발주처', '가상 새봄교육')
  await expect(form.getByLabel('실제 착수일', { exact: true })).toHaveValue(today)
  await form.getByLabel('예정 종료일', { exact: true }).fill(seoulDate(30))
  await form.getByRole('button', { name: '프로젝트 등록' }).click()
  await expect(page.getByRole('heading', { name: NEW_PROJECT, level: 1 })).toBeVisible()
  const projectId = Number(page.url().split('/').pop())
  expect(projectId).toBeGreaterThan(4)

  // 박지훈 PM, 신규 직원 프로그래머(오늘 투입)
  let dialog = await openAddMember(page, '박지훈')
  await dialog.getByRole('radio').first().check()
  await selectOption(page, '수행 역할', 'PM')
  await dialog.getByLabel('실제 투입 시작일', { exact: true }).fill(today)
  await dialog.getByRole('button', { name: '저장하기' }).click()
  await expect(dialog).toBeHidden()
  dialog = await openAddMember(page, NEWBIE.employee_name)
  await dialog.getByRole('radio').first().check()
  await selectOption(page, '수행 역할', '프로그래머')
  await dialog.getByLabel('실제 투입 시작일', { exact: true }).fill(today)
  await dialog.getByRole('button', { name: '저장하기' }).click()
  await expect(dialog).toBeHidden()
  const rows = page.locator('tbody tr')
  await expect(rows).toHaveCount(2)
  await expect(rows.filter({ hasText: '박지훈' })).toContainText('투입 중')
  await expect(rows.filter({ hasText: NEWBIE.employee_name })).toContainText('프로그래머')

  // 같은 직원 재등록은 서버가 409로 막는다(후보 목록에서도 빠진다).
  const manager = await apiContext(await apiLogin('demo01'))
  const duplicate = await manager.post(`projects/${projectId}/members`, {
    data: { employee_id: 3, project_role: 'TESTER' },
  })
  expect(duplicate.status()).toBe(409)
  expect((await duplicate.json()).error.code).toBe('MEMBER_DUPLICATED')
  dialog = await openAddMember(page, '박지훈')
  await expect(dialog.getByText('조건에 맞는 직원이 없어요')).toBeVisible()

  // 착수일 이전 투입은 422
  await dialog.getByPlaceholder('이름 또는 사번').fill('최수빈')
  await dialog.getByRole('radio').first().check()
  await selectOption(page, '수행 역할', '테스터')
  await dialog.getByLabel('실제 투입 시작일', { exact: true }).fill(seoulDate(-1))
  await dialog.getByRole('button', { name: '저장하기' }).click()
  await expect(dialog.getByRole('alert')).toHaveText(
    '투입은 프로젝트 착수일과 직원 입사일 이후여야 해요.',
  )

  // 휴직자 임현우는 후보에 없고, API로 넣어도 422
  await dialog.getByPlaceholder('이름 또는 사번').fill('임현우')
  await expect(dialog.getByText('조건에 맞는 직원이 없어요')).toBeVisible()
  await dialog.getByRole('button', { name: '취소' }).click()
  const onLeave = await manager.post(`projects/${projectId}/members`, {
    data: { employee_id: 9, project_role: 'DESIGNER' },
  })
  expect(onLeave.status()).toBe(422)

  // 진행 중인 프로젝트 3은 평가 대상이 아니다.
  await page.goto('/#/evaluations/write')
  await expect(page.getByRole('heading', { name: '교육 콘텐츠 관리 시스템' })).toHaveCount(0)

  // 새 프로젝트 종료 → 투입 중 두 명의 종료일이 같은 날로 기록된다.
  await page.goto(`/#/projects/${projectId}`)
  await page.getByRole('button', { name: '프로젝트 종료' }).click()
  const closing = page.getByRole('dialog', { name: '프로젝트를 종료할까요?' })
  await expect(closing.getByLabel('실제 종료일', { exact: true })).toHaveValue(today)
  await closing.getByRole('button', { name: '종료 확정' }).click()
  await expect(closing).toBeHidden()
  await expect(page.getByText('종료', { exact: true }).first()).toBeVisible()
  await expect(rows.filter({ hasText: '투입 종료' })).toHaveCount(2)
  await expect(rows.first()).toContainText(`${dotted(today)} ~ ${dotted(today)}`)
  await expect(page.getByRole('button', { name: '구성원 추가' })).toHaveCount(0)

  // PM(박지훈) 토큰으로 구성원 추가 API를 직접 부르면 403
  const pm = await apiContext(await apiLogin('demo03'))
  const forbidden = await pm.post(`projects/${projectId}/members`, {
    data: { employee_id: newbieId, project_role: 'TESTER' },
  })
  expect(forbidden.status()).toBe(403)
  await pm.dispose()
  await manager.dispose()
})

test('장면 3 보강: PM 계정에는 프로젝트·구성원 관리 버튼이 없다', async ({ page }) => {
  await login(page, 'demo05')
  await page.goto('/#/projects/2')
  await expect(
    page.getByRole('heading', { name: '연구 데이터 관리 시스템', level: 1 }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: '정보 수정' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: '프로젝트 종료' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: '구성원 추가' })).toHaveCount(0)
  await page.goto('/#/projects')
  await expect(page.getByRole('button', { name: '프로젝트 등록' })).toHaveCount(0)
})
