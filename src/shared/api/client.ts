import { clearToken, loadToken } from './token.ts'

export interface FieldError {
  field: string
  message: string
}

export interface PageInfo {
  page: number
  size: number
  total_elements: number
  total_pages: number
  has_next: boolean
}

export interface ApiMeta {
  request_id: string
  timestamp: string
}

/** 서버의 `{ error: { code, message, field_errors } }`를 화면에서 쓰는 Error로 바꿉니다. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fieldErrors: FieldError[]

  constructor(status: number, code: string, message: string, fieldErrors: FieldError[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

type QueryValue = string | number | boolean | null | undefined | Array<string | number>
export type Query = Record<string, QueryValue>

const unauthorizedListeners = new Set<() => void>()

/** 토큰 누락·만료로 401을 받으면 토큰을 지우고 등록된 화면 전환을 실행합니다. */
export function onUnauthorized(listener: () => void) {
  unauthorizedListeners.add(listener)
  return () => {
    unauthorizedListeners.delete(listener)
  }
}

export const apiBaseUrl = () =>
  String(import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/+$/, '')

export function buildUrl(path: string, query?: Query) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue
    for (const item of Array.isArray(value) ? value : [value]) params.append(key, String(item))
  }
  const search = params.toString()
  return `${apiBaseUrl()}${path}${search ? `?${search}` : ''}`
}

interface RequestOptions {
  query?: Query
  body?: unknown
  /** 로그인 요청의 401은 비밀번호 오류이므로 로그인 화면 전환을 하지 않습니다. */
  skipUnauthorizedRedirect?: boolean
}

async function send(method: string, path: string, options: RequestOptions = {}) {
  const headers: Record<string, string> = {}
  const token = loadToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  let response: Response
  try {
    response = await fetch(buildUrl(`/api/v1${path}`, options.query), {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', '서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.')
  }
  if (response.ok) return response
  const payload = await response.json().catch(() => null)
  const error = payload?.error
  if (response.status === 401 && !options.skipUnauthorizedRedirect) {
    clearToken()
    unauthorizedListeners.forEach((listener) => listener())
  }
  throw new ApiError(
    response.status,
    error?.code ?? `HTTP_${response.status}`,
    error?.message ?? '요청을 처리하지 못했어요.',
    error?.field_errors ?? [],
  )
}

export async function request<T>(method: string, path: string, options?: RequestOptions) {
  const response = await send(method, path, options)
  if (response.status === 204) return undefined as T
  const payload = (await response.json()) as { data: T }
  return payload.data
}

export async function requestPage<T>(path: string, query?: Query) {
  const response = await send('GET', path, { query })
  return (await response.json()) as { data: T[]; page: PageInfo; meta: ApiMeta }
}

/** CSV처럼 인증이 필요한 파일을 받아 이름과 함께 돌려줍니다. */
export async function requestFile(path: string, query?: Query) {
  const response = await send('GET', path, { query })
  const disposition = response.headers.get('Content-Disposition') ?? ''
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(disposition)?.[1]
  const plain = /filename="?([^";]+)"?/i.exec(disposition)?.[1]
  return {
    blob: await response.blob(),
    filename: encoded ? decodeURIComponent(encoded) : (plain ?? 'download.csv'),
  }
}

export const api = {
  get: <T>(path: string, query?: Query) => request<T>('GET', path, { query }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('POST', path, { ...options, body }),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, { body }),
  delete: (path: string) => request<void>('DELETE', path),
  page: requestPage,
  file: requestFile,
}

/** 인증 없이 서버 상태를 확인합니다. /api/v1 밖의 actuator 경로입니다. */
export async function checkHealth() {
  const response = await fetch(buildUrl('/actuator/health'))
  if (!response.ok) throw new ApiError(response.status, 'HEALTH_FAILED', '서버 상태 확인 실패')
  return (await response.json()) as { status: string }
}
