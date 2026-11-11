import { createContext, useContext } from 'react'
import type { DemoStore } from './types'

export const Store = createContext<DemoStore | null>(null)

export function useStore() {
  const store = useContext(Store)
  if (!store) throw new Error('StoreProvider is missing')
  return store
}
