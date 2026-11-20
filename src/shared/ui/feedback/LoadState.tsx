import { ErrorMessage } from './ErrorMessage'

/** 서버 응답을 기다리는 동안과 실패했을 때의 공통 표시입니다. */
export function LoadState({
  error,
  label = '불러오는 중이에요…',
}: {
  error?: Error | null
  label?: string
}) {
  if (error) return <ErrorMessage error={error.message} />
  return (
    <p className="px-6 py-12 text-center text-xs text-muted" role="status">
      {label}
    </p>
  )
}
