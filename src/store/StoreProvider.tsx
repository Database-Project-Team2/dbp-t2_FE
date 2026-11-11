import type { ReactNode } from 'react'
import { Store } from './StoreContext'
import { useDemoStore } from './useDemoStore'

export function StoreProvider({ children }: { children: ReactNode }) {
  const store = useDemoStore()
  return <Store.Provider value={store}>{children}</Store.Provider>
}
