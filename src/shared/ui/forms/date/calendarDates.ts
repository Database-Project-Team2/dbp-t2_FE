export function parseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(0, 0, 0, 0)
  return date
}
export function dateValue(date: Date) {
  return (
    String(date.getUTCFullYear()).padStart(4, '0') +
    '-' +
    String(date.getUTCMonth() + 1).padStart(2, '0') +
    '-' +
    String(date.getUTCDate()).padStart(2, '0')
  )
}
export function isDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    value >= '0001-01-01' &&
    !Number.isNaN(parseDate(value).getTime()) &&
    dateValue(parseDate(value)) === value
  )
}
export function inRange(value: string, min = '', max = '') {
  return isDate(value) && (!min || value >= min) && (!max || value <= max)
}
export function clampDate(value: string, min = '', max = '') {
  return max && value > max ? max : min && value < min ? min : value
}
export function addDays(value: string, days: number) {
  const date = parseDate(value)
  date.setUTCDate(date.getUTCDate() + days)
  return dateValue(date)
}
export function monthStart(value: string) {
  return value.slice(0, 7) + '-01'
}
export function addMonths(value: string, months: number) {
  const date = parseDate(value)
  const day = date.getUTCDate()
  date.setUTCDate(1)
  date.setUTCMonth(date.getUTCMonth() + months)
  const end = new Date(date)
  end.setUTCMonth(end.getUTCMonth() + 1, 0)
  date.setUTCDate(Math.min(day, end.getUTCDate()))
  return dateValue(date)
}
export function monthAllowed(month: string, min = '', max = '') {
  const end = addDays(addMonths(monthStart(month), 1), -1)
  return (
    (!min || end >= min) &&
    (!max || monthStart(month) <= max) &&
    month >= '0001-01-01' &&
    month <= '9999-12-31'
  )
}
export function calendarDays(month: string) {
  const first = monthStart(month)
  const start = addDays(first, -parseDate(first).getUTCDay())
  return Array.from({ length: 42 }, (_, index) => addDays(start, index))
}
export function dateError(value: string, min = '', max = '') {
  if (!value) return ''
  if (!isDate(value)) return '날짜를 YYYY-MM-DD 형식으로 올바르게 입력해 주세요.'
  if (min && value < min) return min + ' 이후의 날짜를 선택해 주세요.'
  if (max && value > max) return max + ' 이전의 날짜를 선택해 주세요.'
  return ''
}
