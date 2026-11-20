import { StoreProvider } from '../store/StoreProvider'
import { SessionProvider } from './session/SessionProvider'
import { Workspace } from './layout/Workspace'

export default function App() {
  return (
    <SessionProvider>
      <StoreProvider>
        <Workspace />
      </StoreProvider>
    </SessionProvider>
  )
}
