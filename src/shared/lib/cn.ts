import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'

/** 조건부 클래스와 호출부의 스타일 덮어쓰기를 한 곳에서 처리합니다. */
export function cn(...values: ClassValue[]) {
  return twMerge(clsx(values))
}
