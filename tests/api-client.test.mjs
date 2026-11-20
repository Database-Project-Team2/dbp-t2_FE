import test from 'node:test'
import assert from 'node:assert/strict'
import { ApiError, api, buildUrl, onUnauthorized } from '../src/shared/api/client.ts'
import { loadToken, saveToken } from '../src/shared/api/token.ts'

const store = new Map()
globalThis.sessionStorage = {
  getItem: (key) => store.get(key) ?? null,
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
}

function mockFetch(status, body, headers = {}) {
  const calls = []
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init })
    return new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json', ...headers },
    })
  }
  return calls
}

test('쿼리는 빈 값을 빼고 배열은 같은 키로 반복합니다', () => {
  assert.equal(
    buildUrl('/api/v1/employees', { skill: ['Java', 'SQL'], employee_name: '', page: 0 }),
    'http://localhost:8080/api/v1/employees?skill=Java&skill=SQL&page=0',
  )
})

test('성공 응답의 data를 풀고 Bearer 토큰을 보냅니다', async () => {
  saveToken('token-1')
  const calls = mockFetch(200, { data: { id: 1 }, meta: { request_id: 'r', timestamp: 't' } })
  assert.deepEqual(await api.get('/auth/me'), { id: 1 })
  assert.equal(calls[0].init.headers.Authorization, 'Bearer token-1')
})

test('목록 응답은 data와 page를 함께 돌려줍니다', async () => {
  const page = { page: 0, size: 20, total_elements: 1, total_pages: 1, has_next: false }
  mockFetch(200, { data: [{ id: 1 }], page, meta: {} })
  const result = await api.page('/projects', { size: 100 })
  assert.deepEqual(result.data, [{ id: 1 }])
  assert.equal(result.page.total_elements, 1)
})

test('오류 응답을 code·message·field_errors가 있는 ApiError로 바꿉니다', async () => {
  mockFetch(409, {
    error: { code: 'MEMBER_DUPLICATED', message: '이미 등록된 직원입니다.', field_errors: [] },
  })
  await assert.rejects(api.post('/projects/1/members', {}), (error) => {
    assert.ok(error instanceof ApiError)
    assert.equal(error.status, 409)
    assert.equal(error.code, 'MEMBER_DUPLICATED')
    assert.equal(error.message, '이미 등록된 직원입니다.')
    return true
  })
})

test('401이면 토큰을 지우고 로그인 화면 전환을 알립니다', async () => {
  saveToken('expired')
  let notified = 0
  const off = onUnauthorized(() => notified++)
  mockFetch(401, { error: { code: 'UNAUTHORIZED', message: '로그인이 필요해요.' } })
  await assert.rejects(api.get('/auth/me'), ApiError)
  assert.equal(loadToken(), null)
  assert.equal(notified, 1)
  off()
})

test('로그인 실패 401은 화면 전환 없이 오류만 돌려줍니다', async () => {
  let notified = 0
  const off = onUnauthorized(() => notified++)
  mockFetch(401, { error: { code: 'LOGIN_FAILED', message: '확인해 주세요.' } })
  await assert.rejects(
    api.post('/auth/login', {}, { skipUnauthorizedRedirect: true }),
    /확인해 주세요/,
  )
  assert.equal(notified, 0)
  off()
})

test('204는 본문 없이 끝납니다', async () => {
  mockFetch(204)
  assert.equal(await api.delete('/members/1'), undefined)
})

test('CSV 파일 이름을 Content-Disposition에서 읽습니다', async () => {
  globalThis.fetch = async () =>
    new Response('﻿a,b', {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent('평가.csv')}`,
      },
    })
  const file = await api.file('/evaluations/export.csv')
  assert.equal(file.filename, '평가.csv')
})
