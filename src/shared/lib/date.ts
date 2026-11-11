import { assert } from './assert.ts'

export const today = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

export const dateLabel = (date: string | null) => (date ? date.replaceAll('-', '.') : '—')

export function overlapsPeriod(start: string | null, end: string | null, from = '', to = '') {
  if (from && to && from > to) return false
  return !!start && (!from || !end || end >= from) && (!to || start <= to)
}

export function validateDate(value: string, label: string, max = today()) {
  assert(
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(value)) &&
      new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value,
    `${label}을 올바르게 입력해 주세요.`,
  )
  assert(value <= max, `${label}은 ${dateLabel(max)} 이후일 수 없어요.`)
}
