import { expect, test, type Page } from '@playwright/test'
import { resetDatabase } from './support/env'
import {
  NEWBIE,
  NEW_PROJECT,
  apiContext,
  apiLogin,
  prepareClosedNewProject,
} from './support/scenario'
import { login, seoulToday, selectOption } from './support/ui'

let fixture: Awaited<ReturnType<typeof prepareClosedNewProject>>
test.beforeAll(async () => {
  resetDatabase()
  fixture = await prepareClosedNewProject(seoulToday())
})

async function openWrite(page: Page, projectName: string) {
  await page.goto('/#/evaluations/write')
  const row = page.locator('article', { has: page.getByRole('heading', { name: projectName }) })
  await row.getByRole('button', { name: '평가 작성' }).click()
  return page.getByRole('dialog', { name: '프로젝트 평가 작성' })
}

async function fillScores(page: Page) {
  await page.getByRole('button', { name: '업무수행 4점' }).click()
  await page.getByRole('button', { name: '커뮤니케이션 5점' }).click()
  await page.getByLabel('업무수행 평가 의견').fill('맡은 기능을 일정 안에 완성했어요.')
  await page.getByLabel('커뮤니케이션 평가 의견').fill('진행 상황을 먼저 공유했어요.')
}

test('장면 4: PM 평가 → 프로젝트 4 PM 평가 차단·동료평가 → 고객평가 의뢰·등록 → 409 → 회수 차단', async ({
  page,
}) => {
  await login(page, 'demo03')

  // 새 프로젝트에서 신규 직원 PM 평가
  let dialog = await openWrite(page, NEW_PROJECT)
  await selectOption(page, '평가유형', 'PM 평가')
  await selectOption(page, '평가 대상', `${NEWBIE.employee_name} · 프로그래머`)
  await fillScores(page)
  await dialog.getByRole('button', { name: '평가 제출' }).click()
  await expect(dialog).toBeHidden()
  await expect(page.getByRole('status').filter({ hasText: '평가를 제출했어요' })).toBeVisible()

  // 프로젝트 4에서는 설계자라 PM 평가를 고를 수 없고, API도 403
  dialog = await openWrite(page, '유통 분석 대시보드')
  await page.getByRole('combobox', { name: '평가유형' }).click()
  await expect(page.getByRole('option', { name: 'PM 평가' })).toHaveCount(0)
  await page.getByRole('option', { name: '동료평가' }).click()
  const pm = await apiContext(await apiLogin('demo03'))
  const blocked = await pm.post('evaluations', {
    data: {
      target_member_id: 19,
      evaluation_type: 'PM',
      evaluated_date: seoulToday(),
      work_performance_score: 3,
      work_performance_comment: '시도',
      communication_score: 3,
      communication_comment: '시도',
    },
  })
  expect(blocked.status()).toBe(403)

  // 프로젝트 4 동료평가 성공
  await selectOption(page, '평가 대상', '정도윤 · PM')
  await fillScores(page)
  await dialog.getByRole('button', { name: '평가 제출' }).click()
  await expect(dialog).toBeHidden()

  // 새 프로젝트 고객평가 의뢰
  await page.goto(`/#/projects/${fixture.projectId}`)
  await page.getByRole('button', { name: '의뢰일 기록' }).click()
  const record = page.getByRole('dialog', { name: '고객평가 처리일 기록' })
  await record.getByRole('button', { name: '기록하기' }).click()
  await expect(record).toBeHidden()
  await expect(page.getByText('회수 중')).toBeVisible()

  // 신규 직원 고객평가 등록
  dialog = await openWrite(page, NEW_PROJECT)
  await selectOption(page, '평가유형', '고객평가')
  await expect(dialog.getByText('실제 평가자: 박담당 (가상 새봄교육)')).toBeVisible()
  await selectOption(page, '평가 대상', `${NEWBIE.employee_name} · 프로그래머`)
  await fillScores(page)
  await dialog.getByRole('button', { name: '평가 제출' }).click()
  await expect(dialog).toBeHidden()

  // 같은 대상 고객평가 재등록은 409
  const duplicate = await pm.post('evaluations', {
    data: {
      target_member_id: fixture.newbieMemberId,
      evaluation_type: 'CLIENT',
      evaluated_date: seoulToday(),
      work_performance_score: 3,
      work_performance_comment: '중복',
      communication_score: 3,
      communication_comment: '중복',
    },
  })
  expect(duplicate.status()).toBe(409)
  await pm.dispose()

  // 전원(2명) 등록 전 회수는 막힌다.
  await page.goto(`/#/projects/${fixture.projectId}`)
  await expect(page.getByText('고객평가 1 / 2명')).toBeVisible()
  await page.getByRole('button', { name: '전체 회수 완료' }).click()
  const receive = page.getByRole('dialog', { name: '고객평가 처리일 기록' })
  await receive.getByRole('button', { name: '기록하기' }).click()
  await expect(receive.getByRole('alert')).toContainText(
    '참여자 전원의 고객평가가 필요해요. 현재 1/2명',
  )
})

test('장면 4 보강: 진행 중인 프로젝트 3은 평가 목록에 없고 API로도 422', async ({ page }) => {
  await login(page, 'demo02')
  await page.goto('/#/evaluations/write')
  await expect(page.getByRole('heading', { name: '유통 재고관리 시스템' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '교육 콘텐츠 관리 시스템' })).toHaveCount(0)
  const api = await apiContext(await apiLogin('demo02'))
  const response = await api.post('evaluations', {
    data: {
      target_member_id: 11,
      evaluation_type: 'PEER',
      evaluated_date: seoulToday(),
      work_performance_score: 3,
      work_performance_comment: '시도',
      communication_score: 3,
      communication_comment: '시도',
    },
  })
  expect(response.status()).toBe(422)
  await api.dispose()
})
