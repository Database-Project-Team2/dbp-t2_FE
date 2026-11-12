import { today } from '../lib/date.ts'

const CENTURIES: Record<string, number> = {
  '9': 1800,
  '0': 1800,
  '1': 1900,
  '2': 1900,
  '3': 2000,
  '4': 2000,
}

/** 형식만 검사합니다. 임의번호 체계에 맞춰 과거 체크섬은 적용하지 않습니다. */
export function residentNumberError(value: string, referenceDate = today()): string {
  if (!value || value === '-') return '주민등록번호를 입력해 주세요.'
  if (!/^\d{6}-?\d{7}$/.test(value))
    return '주민등록번호 양식이 잘못되었어요. 앞 6자리와 뒤 7자리를 확인해 주세요.'
  const digits = value.replace('-', '')
  const century = CENTURIES[digits[6]]
  if (century === undefined)
    return '주민등록번호 양식이 잘못되었어요. 뒤 첫 번째 숫자를 확인해 주세요.'
  const year = century + Number(digits.slice(0, 2))
  const month = Number(digits.slice(2, 4))
  const day = Number(digits.slice(4, 6))
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    return '주민등록번호 양식이 잘못되었어요. 생년월일을 확인해 주세요.'
  if (date.toISOString().slice(0, 10) > referenceDate)
    return '주민등록번호 양식이 잘못되었어요. 생년월일은 오늘 이후일 수 없어요.'
  return ''
}

export function maskResidentNumber(value: string) {
  return `${value.replace('-', '').slice(0, 6)}-*******`
}
