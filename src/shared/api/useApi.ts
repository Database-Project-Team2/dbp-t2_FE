import { useCallback, useEffect, useState } from 'react'

interface ApiState<T> {
  data: T | undefined
  error: Error | null
  loading: boolean
}

/**
 * 조건(deps)이 바뀔 때마다 서버에서 다시 읽습니다. 늦게 도착한 이전 응답은 버립니다.
 * reload()는 저장 후 화면을 새로 고칠 때 사용합니다.
 */
export function useApi<T>(load: () => Promise<T>, deps: readonly unknown[]) {
  const [state, setState] = useState<ApiState<T>>({ data: undefined, error: null, loading: true })
  const [version, setVersion] = useState(0)
  const key = JSON.stringify(deps)

  useEffect(() => {
    let active = true
    load().then(
      (data) => active && setState({ data, error: null, loading: false }),
      (error: Error) => active && setState((previous) => ({ ...previous, error, loading: false })),
    )
    return () => {
      active = false
    }
    // load는 렌더마다 새로 만들어지므로 deps를 직렬화한 key로 다시 읽을 시점을 정합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, version])

  const reload = useCallback(() => setVersion((value) => value + 1), [])
  return { ...state, reload }
}
