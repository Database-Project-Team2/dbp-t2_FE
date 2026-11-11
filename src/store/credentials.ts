import type { Credential } from './types.ts'

// 브라우저 데모용 비밀번호 처리입니다. 실제 서버 인증 구현을 대신하지 않습니다.

const bytesToHex = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')

export async function makeCredential(password: string, existingSalt?: string): Promise<Credential> {
  const salt = existingSalt || bytesToHex(crypto.getRandomValues(new Uint8Array(16)))
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100000, hash: 'SHA-256' },
    key,
    256,
  )
  return { salt, hash: bytesToHex(new Uint8Array(hash)) }
}

export const requirePassword = (password: string) => {
  if (password.length < 8) throw new Error('비밀번호를 8자 이상 입력해 주세요.')
}
