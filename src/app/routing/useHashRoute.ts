import { useEffect, useState } from 'react'

const readRoute = () => window.location.hash.slice(2) || 'dashboard'

/** 해시 주소를 구독하고 페이지가 바뀌면 스크롤을 맨 위로 돌립니다. */
export function useHashRoute() {
  const [route, setRoute] = useState(readRoute)

  useEffect(() => {
    function handleRouteChange() {
      setRoute(readRoute())
      window.scrollTo({ top: 0, behavior: 'instant' })
    }

    window.addEventListener('hashchange', handleRouteChange)
    return () => window.removeEventListener('hashchange', handleRouteChange)
  }, [])

  return route
}
