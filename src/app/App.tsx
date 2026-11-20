import { SessionProvider } from './session/SessionProvider'
import { Workspace } from './layout/Workspace'

export default function App() {
  return (
    <SessionProvider>
      <Workspace />
    </SessionProvider>
  )
}
